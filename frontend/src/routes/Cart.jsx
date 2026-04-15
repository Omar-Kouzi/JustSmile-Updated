import { useEffect, useState } from "react";
import { getCart, setCart, getProduct } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";
import { useNavigate } from "react-router-dom";

const ls = new SecureLS({ encodingType: "aes" });

const Cart = () => {
  const [cart, setCartState] = useState(null);
  const [productsData, setProductsData] = useState({});
  const navigate = useNavigate();

  // 🔹 helper: get size stock
  const getSizeStock = (product, size) => {
    return Number(product?.sizes?.[size] || 0);
  };

  // 📦 Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const uid = ls.get("uid");
        if (!uid) return;

        const data = await getCart(uid);
        if (!data?.products) {
          setCartState(data);
          return;
        }

        let updatedProducts = { ...data.products };
        let tempProductsData = {};

        const entries = Object.entries(data.products);

        for (let [key, item] of entries) {
          const { productId, size } = item;

          const product = await getProduct(productId);

          if (!product) {
            updatedProducts[key].quantity = 0;
            updatedProducts[key].unavailable = true;
            continue;
          }

          const sizeStock = getSizeStock(product, size);

          tempProductsData[key] = product;

          if (sizeStock === 0) {
            updatedProducts[key].quantity = 0;
            updatedProducts[key].unavailable = true;
          } else {
            if (item.quantity > sizeStock) {
              updatedProducts[key].quantity = sizeStock;
            }
            updatedProducts[key].unavailable = false;
          }
        }

        setCartState({
          userId: uid,
          products: updatedProducts,
        });

        setProductsData(tempProductsData);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, []);

  // 🔁 Update cart
  const updateUserCart = async (updatedProducts) => {
    const uid = ls.get("uid");

    await setCart(uid, {
      userId: uid,
      products: updatedProducts,
    });

    setCartState({
      userId: uid,
      products: updatedProducts,
    });
  };

  // ➕ increase
  const increaseQty = (key) => {
    const updated = { ...cart.products };
    const product = productsData[key];
    const size = updated[key].size;

    if (!product || updated[key].unavailable) return;

    const sizeStock = getSizeStock(product, size);

    if (updated[key].quantity >= sizeStock) {
      return alert("Reached max stock for this size");
    }

    updated[key].quantity += 1;
    updateUserCart(updated);
  };

  // ➖ decrease
  const decreaseQty = (key) => {
    const updated = { ...cart.products };

    if (updated[key].unavailable) return;

    if (updated[key].quantity === 1) {
      delete updated[key];
    } else {
      updated[key].quantity -= 1;
    }

    updateUserCart(updated);
  };

  // 🗑 remove
  const removeItem = (key) => {
    const updated = { ...cart.products };
    delete updated[key];
    updateUserCart(updated);
  };

  if (!cart || !cart.products) return <div className="page">Cart is empty</div>;

  const productList = Object.entries(cart.products);

  // 💰 total
  let totalPrice = 0;
  productList.forEach(([key, item]) => {
    const product = productsData[key];
    if (product && !item.unavailable) {
      totalPrice += item.quantity * product.price;
    }
  });

  const hasItems =
    productList.length > 0 &&
    productList.some(([_, item]) => !item.unavailable && item.quantity > 0);

  return (
    <div className="page Cart-page">
      <div>
        <h1>Your Cart</h1>
        <hr />
      </div>

      <div className="Cart-Items">
        {productList.length === 0 ? (
          <p>Cart is empty</p>
        ) : (
          productList.map(([key, item]) => {
            const product = productsData[key];
            if (!product) return null;

            const sizeStock = getSizeStock(product, item.size);

            return (
              <div key={key}>
                <div className="Cart-Item">
                  <div className="Cart-Item-Data">
                    <img
                      src={product.images?.[0] || "placeholder-image.jpg"}
                      alt={product.name}
                      className="Cart-Item-img"
                    />

                    <div className="Cart-Item-info">
                      <h3>{product.name}</h3>
                      <p>${product.price}</p>

                      {/* ✅ SHOW SIZE */}
                      <p>Size: {item.size}</p>

                      {item.unavailable ? (
                        <p style={{ color: "red" }}>Unavailable</p>
                      ) : (
                        <p>Available: {sizeStock}</p>
                      )}
                    </div>
                  </div>

                  <div className="Cart-Item-Edit">
                    {!item.unavailable && (
                      <div className="Cart-Item-Edit-Buttons">
                        <button onClick={() => decreaseQty(key)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQty(key)}>+</button>
                      </div>
                    )}

                    <button onClick={() => removeItem(key)}>🗑 Remove</button>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        )}
      </div>

      {hasItems && (
        <div className="Cart-Button">
          <h2>Total: ${totalPrice}</h2>
          <button onClick={() => navigate("/order")}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default Cart;
