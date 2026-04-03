import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { getProducts } from "../assets/firebase/firestore";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../assets/firebase/storage";
import { NavLink } from "react-router-dom";

const Dproducts = () => {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle image select (max 2)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    setImages(files);
  };

  // Remove image before upload
  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  // Add product
  const handleSubmit = async () => {
    if (!name || !description || !price || !stock) {
      alert("Fill all fields");
      return;
    }

    if (images.length !== 2) {
      alert("Upload exactly 2 images");
      return;
    }

    try {
      const urls = await uploadMultipleImages(images, "products");

      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: urls,
        createdAt: new Date(),
      });

      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setImages([]);

      fetchProducts();
      alert("Product added!");
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      if (product.images?.length) {
        await deleteMultipleImages(product.images);
      }

      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="page">
      <h1>Dashboard - Products</h1>

      {/* Add Product */}
      <details>
        <summary>Add Product</summary>
        <div className="Dashboard-Add-Product">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
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

          {/* Custom file button */}
          <div>
            <button
              className="custom-file-button"
              onClick={() => document.getElementById("imagesInput").click()}
              style={{
                backgroundColor: "#ffccd8",
                padding: "8px 12px",
                borderRadius: "5px",
                marginBottom: "5px",
              }}
            >
              Upload Images (max 2)
            </button>
            <input
              id="imagesInput"
              type="file"
              multiple
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {/* 👀 Preview */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={URL.createObjectURL(img)}
                  width="200"
                  alt="preview"
                  style={{ borderRadius: "5px" }}
                />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    width: "20px",
                    height: "20px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit}>Add Product</button>
        </div>
      </details>

      <hr />

      {/* Product List */}
      <div className="Products-Grid">
        {products.map((product) => (
          <div key={product.id} className="Product-Card">
            <div className="Product-Image-Wrap">
              <img
                src={product.images?.[0] || "placeholder-image.jpg"}
                alt={product.name}
                className="primary-img"
              />
              {product.images?.[1] && (
                <img
                  src={product.images[1]}
                  alt={`${product.name}-hover`}
                  className="hover-img"
                />
              )}
            </div>

            <p>{product.name}</p>
            <p>${product.price}</p>

            <div className="product-buttons">
              <NavLink to={`/dashboard/Dproduct/${product.id}`}>
                <button>View More</button>
              </NavLink>
              <button
                onClick={() => handleDelete(product)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dproducts;
