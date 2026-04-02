import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct, getCart, setCart } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // 🛒 ADD TO CART (ONLY QUANTITY STORED)
  const handleAddToCart = async () => {
    if (!product) return;
    try {
      const uid = ls.get("uid");
      if (!uid) return alert("Login first");

      const cart = await getCart(uid);
      let products = cart?.products || {};

      const currentQty = products[id]?.quantity || 0;
      const newQty = currentQty + quantity;

      if (newQty > product.stock) {
        return alert(`Only ${product.stock} items available`);
      }

      products[id] = { quantity: newQty };

      await setCart(uid, { userId: uid, products });

      alert("Added to cart ✅");
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="Product-page page">
      <div className="Product-Data">
        <h1>{product.name}</h1>
        <p>Price: ${product.price}</p>
        <p>{product.description}</p>
        <p>Available: {product.stock}</p>

        {product.stock > 0 && (
          <div className="Product-cart">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                let value = Math.max(1, Number(e.target.value));
                if (value > product.stock) value = product.stock;
                setQuantity(value);
              }}
            />

            <button onClick={handleAddToCart}>add to cart</button>
          </div>
        )}
      </div>

      <div className="Product-Image-Wrap">
        <img
          src={product.images?.[0] || "placeholder-image.jpg"}
          alt={product.name}
          className="Product-img primary-img"
        />
        {product.images?.[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            className="Product-img hover-img"
          />
        )}
      </div>
    </div>
  );
};

export default Product;