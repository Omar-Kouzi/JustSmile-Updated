import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct, getCart, updateCart } from "../assets/firebase/firestore";
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

  // 🛒 ADD TO CART
  const handleAddToCart = async () => {
    try {
      const uid = ls.get("uid");
      if (!uid) return alert("Login first");

      const cart = await getCart(uid);
      let products = cart?.products || {};

      if (products[id]) {
        products[id].quantity += quantity;
      } else {
        products[id] = {
          quantity: quantity,
          price: product.price,
        };
      }

      // 🔥 recalc total
      let totalPrice = 0;
      Object.values(products).forEach((p) => {
        totalPrice += p.quantity * p.price;
      });

      await updateCart(uid, {
        userId: uid,
        products,
        totalPrice,
      });

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

        <div className="Product-cart">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <button onClick={handleAddToCart}>
            add to cart
          </button>
        </div>
      </div>

      <img
        src={product.image || "placeholder-image.jpg"}
        alt={product.name}
        className="Product-img"
      />
    </div>
  );
};

export default Product;