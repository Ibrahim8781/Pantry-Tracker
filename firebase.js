// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: " ",
  authDomain: "pantry-tracker-4c3b1.firebaseapp.com",
  projectId: "pantry-tracker-4c3b1",
  storageBucket: "pantry-tracker-4c3b1.appspot.com",
  messagingSenderId: "30192324131",
  appId: "1:30192324131:web:f09e6b6ca4f702b6f66b96",
  measurementId: "G-6YSG4SY74P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore };