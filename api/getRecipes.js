// api/getRecipes.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { items } = req.body;
      const apiKey = '761414eecd8046faaeb964be0beb577a'; // Replace with your API key
      const ingredients = items.join(','); // Convert array to comma-separated string
  
      try {
        const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${apiKey}`);
        const data = await response.json();
        res.status(200).json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recipes' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  