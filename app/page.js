'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { Box, Typography, Stack, Button, Modal, TextField } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}


// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0d47a1',  // Dark blue
    },
    background: {
      default: '#121212',  // Dark background
      paper: '#1e1e1e',    // Dark paper
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
  },
});

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // New state for edit modal
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemImage, setItemImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [currentItem, setCurrentItem] = useState(null); // New state to track the item being edited
  const [itemDescription, setItemDescription] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [recipes, setRecipes] = useState([]);


  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const storage = getStorage();

  
  

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
  };


  const addItem = async (item, quantity, image, description) => {
    let imageUrl = "";
    if (image) {
      const imageRef = ref(storage, `images/${item}_${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }
    
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data();
      await setDoc(docRef, {
        quantity: existingQuantity + quantity,
        imageUrl,
        description
      }, { merge: true });
    } else {
      await setDoc(docRef, {
        quantity,
        imageUrl,
        description
      });
    }
  
    await updatePantry();
  };
  

  const editItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await setDoc(docRef, { quantity }, { merge: true });
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "pantry"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };
  


  useEffect(() => {
    updatePantry();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleEditOpen = (item) => {
    setCurrentItem(item);
    setItemQuantity(item.quantity);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setUploadStatus(`Selected file: ${file.name}`);
    } else {
      setItemImage(null);
      setUploadStatus("");
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        width="100vw"
        height="100vh"
        display={"flex"}
        justifyContent={"center"}
        flexDirection={"column"}
        alignItems={"center"}
        gap={2}
        bgcolor="background.default"
        color="text.primary"
      >
        <Typography variant="h3" gutterBottom>
            Pantry Tracker
          </Typography>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={{ ...style, bgcolor: "background.paper" }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={"column"} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                id="outlined-basic"
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              />
              <TextField
                id="outlined-basic"
                label="Description"
                variant="outlined"
                fullWidth
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
              />
              <Button
                variant="contained"
                component="label"
                color="primary"
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  onChange={handleImageUpload}
                />
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  addItem(itemName, itemQuantity, itemImage, itemDescription);
                  setItemName("");
                  setItemQuantity(1);
                  setItemDescription("");  // Clear description input
                  setItemImage(null);
                  setUploadStatus("");
                  handleClose();
                }}
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              >
                Add
              </Button>
            </Stack>
            {uploadStatus && (
              <Typography variant="body2" color="textSecondary">
                {uploadStatus}
              </Typography>
            )}
          </Box>
        </Modal>

        <Modal
          open={editOpen}
          onClose={handleEditClose}
          aria-labelledby="edit-modal-modal-title"
          aria-describedby="edit-modal-modal-description"
        >
          <Box sx={{ ...style, bgcolor: "background.paper" }}>
            <Typography id="edit-modal-modal-title" variant="h6" component="h2">
              Edit Item Quantity
            </Typography>
            <Stack width="100%" direction={"row"} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Quantity"
                type="number"
                variant="outlined"
                fullWidth
                value={itemQuantity}
                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
              />
              <Button
                variant="contained"
                onClick={() => {
                  editItem(currentItem.name, itemQuantity);
                  setItemQuantity(1);
                  handleEditClose();
                }}
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Modal>

        <TextField
    variant="outlined"
    label="Search"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    sx={{
      marginBottom: 2,
      bgcolor: "background.paper",
      color: "text.primary",
      width: '300px'  // Adjust the width as desired
    }}
  />


        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Add New Item
        </Button>
        <Box
          width="90%"
          maxWidth="1000px"
          bgcolor="background.paper"
          color="text.primary"
          borderRadius="8px"
          p={2}
          boxShadow={3}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
            p={2}
            bgcolor="primary.main"
            borderRadius="8px"
          >
            <Typography variant="h6" color="text.primary">Item Name</Typography>
            <Typography variant="h6" color="text.primary">Description</Typography>
            <Typography variant="h6" color="text.primary">Quantity</Typography>
            <Typography variant="h6" color="text.primary">Image</Typography>
            <Typography variant="h6" color="text.primary">Actions</Typography>
          </Box>
          <Stack spacing={2} overflow="auto">
            {filteredPantry.length > 0 ? (
              filteredPantry.map(({ name, quantity, imageUrl, description }) => (
                <Box
                  key={name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  bgcolor="#1e1e1e"
                  borderRadius="8px"
                >
                  <Typography variant="body1" color="text.primary">
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {description || 'NULL'}
                  </Typography>
                  <Typography variant="body1" color="text.primary">
                    {quantity || 'NULL'}
                  </Typography>
                  {imageUrl ? (
                    <img src={imageUrl} alt={name} width="50" height="50" />
                  ) : (
                    <Typography variant="body1" color="text.primary">NULL</Typography>
                  )}
                  <Stack direction={"row"} spacing={2}>
                    <Button
                      variant="contained"
                      onClick={() => handleEditOpen({ name, quantity })}
                      sx={{ bgcolor: 'primary.main', color: 'white' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => removeItem(name)}
                      sx={{ bgcolor: 'primary.main', color: 'white' }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))
            ) : (
              <Typography variant="body1" color="text.primary" textAlign="center">
                Not present
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );  
}
