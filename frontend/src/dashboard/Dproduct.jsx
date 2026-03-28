import { useState } from "react";
import { db } from "../assets/firebase/config";
import { collection, addDoc } from "firebase/firestore";

const Dproduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const handleSubmit = async () => {
    if (!name || !description || !price || !stock) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        createdAt: new Date(),
      });

      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      alert("Product added!");
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div>
      <h1>Add Product</h1>
      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Product description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <button onClick={handleSubmit}>Add Product</button>
    </div>
  );
};

export default Dproduct;