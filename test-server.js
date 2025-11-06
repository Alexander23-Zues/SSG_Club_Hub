import express from "express";

const app = express();
const PORT = 9999;

app.get('/', (req, res) => {
  res.send('Test server running!');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});