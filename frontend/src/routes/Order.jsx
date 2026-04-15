import { useEffect, useState } from "react";
import { getCart, getProduct, setCart } from "../assets/firebase/firestore";
import { db } from "../assets/firebase/config";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import SecureLS from "secure-ls";
import MapPicker from "../components/Mappicker";

const ls = new SecureLS({ encodingType: "aes" });

const Order = () => {
  const [cart, setCartState] = useState(null);
  const [productsData, setProductsData] = useState({});
  const [location, setLocation] = useState(null);

  const [defaultLocation, setDefaultLocation] = useState(null);
  const [useDefault, setUseDefault] = useState(false);

  const [payment, setPayment] = useState("cash");
  const [wishRef, setWishRef] = useState("");

  // ✅ FETCH CART + VALIDATE AVAILABILITY
  useEffect(() => {
    const fetchCart = async () => {
      const uid = ls.get("uid");
      if (!uid) return;

      const data = await getCart(uid);
      if (!data?.products) return setCartState(data);

      let updatedProducts = { ...data.products };
      let tempProducts = {};

      for (let [key, item] of Object.entries(data.products)) {
        const product = await getProduct(item.productId);

        if (!product) {
          updatedProducts[key].unavailable = true;
          continue;
        }

        tempProducts[key] = product;

        const sizeStock = product.sizes?.[item.size] || 0;

        // ❌ SIZE DOESN'T EXIST OR OUT OF STOCK
        if (sizeStock <= 0) {
          updatedProducts[key].unavailable = true;
          updatedProducts[key].quantity = 0;
        } else {
          updatedProducts[key].unavailable = false;

          // ✅ Clamp quantity to available stock
          if (item.quantity > sizeStock) {
            updatedProducts[key].quantity = sizeStock;
          }
        }
      }

      setCartState({ userId: uid, products: updatedProducts });
      setProductsData(tempProducts);
    };

    fetchCart();
  }, []);

  // ✅ FETCH USER LOCATION
  useEffect(() => {
    const fetchUserLocation = async () => {
      const uid = ls.get("uid");
      if (!uid) return;

      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data();
        if (data?.location) setDefaultLocation(data.location);
      }
    };

    fetchUserLocation();
  }, []);

  const productList = cart?.products ? Object.entries(cart.products) : [];

  // ✅ TOTAL PRICE (ONLY AVAILABLE ITEMS)
  let totalPrice = 0;

  productList.forEach(([id, item]) => {
    const product = productsData[id];
    if (!product || item.unavailable) return;

    totalPrice += item.quantity * product.price;
  });

  const isWishValid = payment === "wish" && wishRef.length === 9;

  const handleUseDefault = () => {
    setLocation(defaultLocation);
    setUseDefault(true);
  };

  // ✅ ORDER
  const handleOrder = async () => {
    const uid = ls.get("uid");

    if (!location) return alert("Select location");

    try {
      // ❌ Remove unavailable items before ordering
      const validProducts = {};
      Object.entries(cart.products).forEach(([key, item]) => {
        if (!item.unavailable && item.quantity > 0) {
          validProducts[key] = item;
        }
      });

      if (Object.keys(validProducts).length === 0) {
        return alert("No available items in your cart");
      }

      const orderDoc = await addDoc(collection(db, "orders"), {
        userId: uid,
        products: cart.products,
        location,
        total: totalPrice,
        paymentMethod: payment,
        wishRef: payment === "wish" ? wishRef : null, // ✅ SAVE IT
        createdAt: new Date(),

        viewed: false,
        status: "pending",
        paymentStatus: payment === "wish" ? "waiting_verification" : "pending",
      });
      const purchases = Object.entries(cart.products).map(([id, item]) => ({
        productId: id,
        quantity: item.quantity,
      }));

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        purchases: arrayUnion({
          orderId: orderDoc.id,
          products: purchases,
          location,
          createdAt: new Date(),
        }),
      });

      // ✅ REDUCE STOCK
      for (let item of Object.values(validProducts)) {
        const ref = doc(db, "products", item.productId);
        const snap = await getDoc(ref);
        if (!snap.exists()) continue;

        const data = snap.data();
        const newSizes = { ...data.sizes };

        if (newSizes[item.size]) {
          newSizes[item.size] -= item.quantity;
          if (newSizes[item.size] < 0) newSizes[item.size] = 0;
        }

        const newStock = Object.values(newSizes).reduce((sum, v) => sum + v, 0);

        await updateDoc(ref, {
          sizes: newSizes,
          stock: newStock,
        });
      }

      await setCart(uid, { userId: uid, products: {} });

      alert("Order placed!");

      setCartState({ userId: uid, products: {} });
      setLocation(null);
      setWishRef("");
      setUseDefault(false);
    } catch (error) {
      console.error("Order error:", error);
    }
  };

  if (!cart) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Order Summary</h1>
      <hr />
      {/* PRODUCTS */}
      <div>
        {productList.map(([id, item]) => {
          const product = productsData[id];
          if (!product) return null;

          return (
            <div key={id}>
              <div className="Cart-Item-Data Purchase-Item-Data">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="Cart-Item-img"
                />

                <div>
                  <h3>{product.name}</h3>
                  <p>${product.price}</p>
                  <p>Size: {item.size}</p>
                  <p>Qty: {item.quantity}</p>

                  {/* ❌ UNAVAILABLE MESSAGE */}
                  {item.unavailable && (
                    <p style={{ color: "red" }}>
                      This size is unavailable and won't be included
                    </p>
                  )}
                </div>
              </div>
              <hr />
            </div>
          );
        })}
      </div>
      <h2>Total: ${totalPrice}</h2>
      <hr />
      {/* LOCATION */}
      <div>
        <h3>Delivery Location</h3>

        {defaultLocation && !useDefault && (
          <>
            <p>{defaultLocation.address}</p>
            <button onClick={handleUseDefault}>Use Saved Address</button>
          </>
        )}

        <MapPicker
          value={location || defaultLocation}
          onSelect={(loc) => {
            setLocation(loc);
            setUseDefault(false);
          }}
        />

        {location && <p>Selected: {location.address}</p>}
      </div>
      {/* PAYMENT */}
      <div>
        <h3>Payment</h3>
        <div className="Order-Payment-Holder">
          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="wish">Wish</option>
            {/* <option value="card">Card</option> */}
          </select>
          {payment === "wish" && (
            <div className="Payment-Box">
              {" "}
              <p>Send the total via Whish Money:</p>
              <p>
                <strong>Phone:</strong> 81284452
              </p>
              <p>
                <strong>Name:</strong> Omar Kouzi
              </p>
              <input
                type="text"
                placeholder="Transaction ID (9 chars)"
                value={wishRef}
                maxLength={9}
                onChange={(e) => setWishRef(e.target.value)}
                style={{ marginTop: "10px" }}
              />
              {wishRef && wishRef.length !== 9 && (
                <p style={{ color: "red", fontSize: "12px" }}>
                  Reference must be exactly 9 characters
                </p>
              )}
              <p style={{ marginTop: "10px", fontSize: "14px" }}>
                After paying in the Wish app, enter the transaction ID above.
              </p>
            </div>
          )}
          {payment === "card" && (
            <div className="Payment-Box">
              <p>Credit Card payment coming soon</p>
            </div>
          )}
        </div>
      </div>
      <br />
      {/* CONFIRM ORDER */}{" "}
      <button
        onClick={handleOrder}
        disabled={payment === "wish" && !isWishValid}
        style={{
          position: "relative",
          left: "39%",
          marginBottom: "10px",
          opacity: payment === "wish" && !isWishValid ? 0.5 : 1,
          cursor:
            payment === "wish" && !isWishValid ? "not-allowed" : "pointer",
        }}
      >
        Confirm Order
      </button>
      <br />
    </div>
  );
};

export default Order;
