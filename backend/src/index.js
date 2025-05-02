// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 4000;
const DATA_PATH = path.join(__dirname, "products.json");

app.use(cors());
app.use(express.json());

// Read data
const readData = () => {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(DATA_PATH, JSON.stringify([]));
      return [];
    }

    const data = fs.readFileSync(DATA_PATH, "utf-8");
    if (!data.trim()) {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read or parse JSON:", err);
    return [];
  }
};

// Write data
const writeData = (data) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

// Get all products
app.get("/products", (req, res) => {
  const products = readData();
  if (!products) return [];
  res.json(products);
});

// Add new product
app.post("/products", (req, res) => {
  const products = readData();
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// Update product
app.put("/products/:id", (req, res) => {
  const products = readData();
  const updatedProducts = products.map((p) =>
    p.id === parseInt(req.params.id) ? { ...p, ...req.body } : p
  );
  writeData(updatedProducts);
  res.json({ success: true });
});

// Delete product
app.delete("/products/:id", (req, res) => {
  const products = readData();
  const filtered = products.filter((p) => p.id !== parseInt(req.params.id));
  writeData(filtered);
  res.json({ success: true });
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
