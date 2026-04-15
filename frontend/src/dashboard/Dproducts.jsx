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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // ❌ removed stock state

  const [images, setImages] = useState([null, null]);

  const [sizes, setSizes] = useState({
    S: "",
    M: "",
    L: "",
    XL: "",
  });

  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (file, index) => {
    const updated = [...images];
    updated[index] = file;
    setImages(updated);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated[index] = null;
    setImages(updated);
  };

  const handleSizeChange = (size, value) => {
    setSizes({ ...sizes, [size]: value });
  };

  // ✅ LIVE STOCK CALCULATION
  const totalStock = Object.values(sizes).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0,
  );

  const handleSubmit = async () => {
    if (!name || !description || !price) {
      alert("Fill all fields");
      return;
    }

    if (!images[0] || !images[1]) {
      alert("Upload both images");
      return;
    }

    const filteredSizes = {};
    Object.entries(sizes).forEach(([s, v]) => {
      if (Number(v) > 0) filteredSizes[s] = parseInt(v);
    });

    if (Object.keys(filteredSizes).length === 0) {
      alert("Add at least one size with stock");
      return;
    }

    try {
      const urls = await uploadMultipleImages(images, "products");

      await addDoc(collection(db, "products"), {
        name,
        description,
        price: parseFloat(price),
        stock: totalStock, // ✅ AUTO CALCULATED
        images: urls,
        sizes: filteredSizes,
        createdAt: new Date(),
      });

      setName("");
      setDescription("");
      setPrice("");
      setImages([null, null]);
      setSizes({ S: "", M: "", L: "", XL: "" });

      fetchProducts();
      alert("Product added!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      if (product.images?.length) {
        await deleteMultipleImages(product.images);
      }

      await deleteDoc(doc(db, "products", product.id));
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page">
      <h1>Dashboard - Products</h1>

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

          {/* ❌ REMOVED stock input */}

          {/* ✅ Sizes */}
          <p>Select Sizes:</p>
          <div className="sizes">
            {["S", "M", "L", "XL"].map((size) => (
              <div key={size}>
                <label>{size}</label>
                <input
                  type="number"
                  value={sizes[size]}
                  onChange={(e) => handleSizeChange(size, e.target.value)}
                  style={{ marginLeft: "10px", width: "70px" }}
                />
              </div>
            ))}
          </div>

          {/* ✅ LIVE STOCK DISPLAY */}
          <p>
            <strong>Total Stock: {totalStock}</strong>
          </p>

          {/* MAIN IMAGE */}
          <div style={{ marginBottom: "20px" }}>
            <p>Main Image</p>

            {images[0] && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={URL.createObjectURL(images[0])}
                  alt="main"
                  style={{ width: "200px", borderRadius: "5px" }}
                />
                <button
                  onClick={() => removeImage(0)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={() => document.getElementById("mainInput").click()}
              className="custom-file-button"
            >
              Upload Main Image
            </button>

            <input
              id="mainInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(e.target.files[0], 0)}
            />
          </div>

          {/* SECONDARY IMAGE */}
          <div style={{ marginBottom: "20px" }}>
            <p>Secondary Image</p>

            {images[1] && (
              <div style={{ position: "relative", display: "inline-block" }}>
                <img
                  src={URL.createObjectURL(images[1])}
                  alt="secondary"
                  style={{ width: "200px", borderRadius: "5px" }}
                />
                <button
                  onClick={() => removeImage(1)}
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <button
              onClick={() => document.getElementById("secondaryInput").click()}
              className="custom-file-button"
            >
              Upload Secondary Image
            </button>

            <input
              id="secondaryInput"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(e.target.files[0], 1)}
            />
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
            <p>Stock: {product.stock}</p> {/* ✅ now always correct */}
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
