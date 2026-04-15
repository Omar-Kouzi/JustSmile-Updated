import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getProduct } from "../assets/firebase/firestore";
import {
  uploadMultipleImages,
  deleteMultipleImages,
} from "../assets/firebase/storage";

const Dproduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [sizes, setSizes] = useState({}); // ✅ object now

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);

        // Fill form
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
        setExistingImages(data.images || []);

        // ✅ HANDLE OLD + NEW FORMAT
        if (Array.isArray(data.sizes)) {
          const converted = {};
          data.sizes.forEach((s) => {
            converted[s] = 1; // default stock
          });
          setSizes(converted);
        } else {
          setSizes(data.sizes || {});
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2);
    setImages(files);
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  // Sizes change
  const handleSizeChange = (size, value) => {
    setSizes({
      ...sizes,
      [size]: value,
    });
  };

  // ✅ UPDATE PRODUCT
  const handleUpdate = async () => {
    if (name.trim() === "" || description.trim() === "" || price === "") {
      return alert("Fill all fields");
    }

    try {
      let finalImages = [...existingImages];

      if (images.length > 0) {
        if (existingImages.length) {
          await deleteMultipleImages(existingImages);
        }

        const urls = await uploadMultipleImages(images, "products");
        finalImages = urls;
      }

      const cleanedSizes = Object.fromEntries(
        Object.entries(sizes).filter(([_, v]) => v > 0),
      );

      // ✅ CALCULATE TOTAL STOCK
      const totalStock = Object.values(cleanedSizes).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0,
      );

      await updateDoc(doc(db, "products", id), {
        name,
        description,
        price: parseFloat(price),
        stock: totalStock, // ✅ AUTO
        images: finalImages,
        sizes: cleanedSizes,
      });

      alert("Product updated ✅");
      navigate("/dashboard/Dproducts");
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // ❌ DELETE PRODUCT
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      if (existingImages.length) {
        await deleteMultipleImages(existingImages);
      }

      await deleteDoc(doc(db, "products", id));
      alert("Deleted ✅");
      navigate("/dashboard/Dproducts");
    } catch (error) {
      console.error(error);
    }
  };

  if (!product) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Edit Product</h1>

      <div className="Dashboard-Add-Product">
        <label>Product Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />

        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        <label>Price:</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />

    

        {/* ✅ Sizes */}
        <div className="sizes">
          <p>Sizes:</p>

          {["S", "M", "L", "XL"].map((size) => (
            <div key={size}>
              <label style={{ marginRight: "10px" }}>{size}</label>

              <input
                type="number"
                placeholder="stock"
                value={sizes[size] || ""}
                onChange={(e) => handleSizeChange(size, e.target.value)}
                style={{ width: "70px" }}
              />
            </div>
          ))}
        </div>
          <p>STOCK : {stock}</p>
        {/* Upload new images */}
        <input type="file" multiple onChange={handleImageChange} />

        {/* Existing images */}
        <div style={{ display: "flex", gap: "10px" }}>
          {existingImages.map((img, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={img}
                alt="product"
                style={{
                  width: "200px",
                  height: "200px",
                  objectFit: "cover",
                }}
              />
              <button
                onClick={() => removeExistingImage(i)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "red",
                  color: "#fff",
                  border: "none",
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* Preview new images */}
        <div style={{ display: "flex", gap: "10px" }}>
          {images.map((img, i) => (
            <img
              key={i}
              src={URL.createObjectURL(img)}
              alt="preview"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
              }}
            />
          ))}
        </div>

        <button onClick={handleUpdate}>Update Product</button>

        <button
          onClick={handleDelete}
          style={{ background: "red", color: "#fff" }}
        >
          Delete Product
        </button>
      </div>
    </div>
  );
};

export default Dproduct;
