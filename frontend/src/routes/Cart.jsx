import { useEffect, useState } from "react";
import { getCart, setCart, getProduct } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";
import { useNavigate } from "react-router-dom";
const ls = new SecureLS({ encodingType: "aes" });

const Cart = () => {
  const [cart, setCartState] = useState(null);
  const [productsData, setProductsData] = useState({});
  const navigate = useNavigate();
  // 📦 Fetch cart + real product data
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

        for (let [id, item] of entries) {
          const product = await getProduct(id);

          if (!product || product.stock === 0) {
            // mark unavailable
            updatedProducts[id].quantity = 0;
            updatedProducts[id].unavailable = true;
            tempProductsData[id] = product || {
              name: item.name,
              image: item.image,
            };
          } else {
            tempProductsData[id] = product;

            // adjust quantity if it exceeds stock
            if (item.quantity > product.stock) {
              updatedProducts[id].quantity = product.stock;
            }

            updatedProducts[id].unavailable = false;
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

  // 🔁 update cart in Firestore + state
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

  // ➕ increase quantity with stock limit
  const increaseQty = (id) => {
    const updated = { ...cart.products };
    const product = productsData[id];

    if (!product || updated[id].unavailable) return;

    if (updated[id].quantity >= product.stock) {
      return alert("Reached max stock");
    }

    updated[id].quantity += 1;
    updateUserCart(updated);
  };

  // ➖ decrease quantity
  const decreaseQty = (id) => {
    const updated = { ...cart.products };
    if (updated[id].unavailable) return; // no changing if unavailable

    if (updated[id].quantity === 1) {
      delete updated[id];
    } else {
      updated[id].quantity -= 1;
    }
    updateUserCart(updated);
  };

  // 🗑 remove item
  const removeItem = (id) => {
    const updated = { ...cart.products };
    delete updated[id];
    updateUserCart(updated);
  };

  if (!cart || !cart.products) return <div>Cart is empty</div>;

  const productList = Object.entries(cart.products);

  // 💰 calculate total dynamically
  let totalPrice = 0;
  productList.forEach(([id, item]) => {
    const product = productsData[id];
    if (product && !item.unavailable) {
      totalPrice += item.quantity * product.price;
    }
  });

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
          productList.map(([id, item]) => {
            const product = productsData[id];
            if (!product) return null;

            return (
              <div key={id}>
                <div className="Cart-Item">
                  <div className="Cart-Item-Data">
                    <img
                      src={product?.images?.[0]  || item.image}
                      alt={product?.name || item.name}
                      className="Cart-Item-img"
                    />
                    <div className="Cart-Item-info">
                      <h3>{product?.name || item.name}</h3>
                      <p>${product?.price || item.price}</p>
                      {item.unavailable ? (
                        <p style={{ color: "red" }}>Unavailable</p>
                      ) : (
                        <p>Available: {product.stock}</p>
                      )}
                    </div>
                  </div>

                  <div className="Cart-Item-Edit">
                    {!item.unavailable && (
                      <div className="Cart-Item-Edit-Buttons">
                        <button onClick={() => decreaseQty(id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQty(id)}>+</button>
                      </div>
                    )}

                    <button onClick={() => removeItem(id)}>🗑 Remove</button>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        )}
      </div>
      <div className="Cart-Button">
        <h2>Total: ${totalPrice}</h2>

        <button onClick={() => navigate("/order")}>Place Order</button>
      </div>
    </div>
  );
};

export default Cart;
