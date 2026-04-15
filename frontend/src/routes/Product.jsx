import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProduct, getCart, setCart } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");

  // 🔹 calculate total stock
  const getTotalStock = (product) => {
    if (product.sizes && typeof product.sizes === "object") {
      return Object.values(product.sizes).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0
      );
    }
    return product.stock || 0;
  };

  // 🔹 get stock for selected size
  const getSizeStock = () => {
    if (!selectedSize) return 0;
    return Number(product.sizes?.[selectedSize] || 0);
  };

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
    if (!product) return;

    if (!selectedSize) {
      return alert("Select a size first");
    }

    try {
      const uid = ls.get("uid");
      if (!uid) return alert("Login first");

      const cart = await getCart(uid);
      let products = cart?.products || {};

      const key = `${id}_${selectedSize}`; // ✅ unique per size

      const currentQty = products[key]?.quantity || 0;
      const newQty = currentQty + quantity;

      const sizeStock = getSizeStock();

      if (newQty > sizeStock) {
        return alert(`Only ${sizeStock} items available for size ${selectedSize}`);
      }

      products[key] = {
        productId: id,
        size: selectedSize,
        quantity: newQty,
      };

      await setCart(uid, { userId: uid, products });

      alert("Added to cart ✅");
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  if (!product) return <div className="page">Loading...</div>;

  const totalStock = getTotalStock(product);
  const sizeStock = getSizeStock();

  return (
    <div className="Product-page page">
      <div className="Product-Data">
        <h1>{product.name}</h1>
        <p>Price: ${product.price}</p>
        <p>{product.description}</p>

        {/* ✅ TOTAL STOCK */}
        <p>Total Available: {totalStock}</p>

        {/* ✅ SIZE SELECTOR */}
        {product.sizes && (
          <div style={{ margin: "10px 0" }}>
            <p>Select Size:</p>

            {Object.entries(product.sizes).map(([size, qty]) => {
              const disabled = qty <= 0;

              return (
                <button
                  key={size}
                  disabled={disabled}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1); // reset qty when size changes
                  }}
                  style={{
                    marginRight: "10px",
                    padding: "5px 10px",
                    border:
                      selectedSize === size
                        ? "2px solid black"
                        : "1px solid #ccc",
                    background: disabled ? "#eee" : "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {size} ({qty})
                </button>
              );
            })}
          </div>
        )}

        {/* ✅ SELECTED SIZE STOCK */}
        {selectedSize && (
          <p>
            Available for {selectedSize}: {sizeStock}
          </p>
        )}

        {/* ✅ CART */}
        {sizeStock > 0 && (
          <div className="Product-cart">
            <input
              type="number"
              min="1"
              max={sizeStock}
              value={quantity}
              onChange={(e) => {
                let value = Math.max(1, Number(e.target.value));
                if (value > sizeStock) value = sizeStock;
                setQuantity(value);
              }}
            />

            <button onClick={handleAddToCart}>
              add to cart
            </button>
          </div>
        )}

        {/* ❌ OUT OF STOCK */}
        {totalStock === 0 && <p>Out of stock</p>}
      </div>

      {/* ✅ IMAGES */}
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