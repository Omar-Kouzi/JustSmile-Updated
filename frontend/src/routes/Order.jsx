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

  // 🔥 NEW
  const [defaultLocation, setDefaultLocation] = useState(null);
  const [useDefault, setUseDefault] = useState(false);

  const [payment, setPayment] = useState("cash");
  const [wishRef, setWishRef] = useState("");

  // =========================
  // 🔹 FETCH CART
  // =========================
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

        for (let [id, item] of Object.entries(data.products)) {
          const product = await getProduct(id);

          if (!product || product.stock === 0) {
            updatedProducts[id].quantity = 0;
            updatedProducts[id].unavailable = true;

            tempProductsData[id] = product || {
              name: item.name,
              image: item.image,
            };
          } else {
            tempProductsData[id] = product;
            if (item.quantity > product.stock)
              updatedProducts[id].quantity = product.stock;
            updatedProducts[id].unavailable = false;
          }
        }

        setCartState({ userId: ls.get("uid"), products: updatedProducts });
        setProductsData(tempProductsData);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, []);

  // =========================
  // 🔹 FETCH USER DEFAULT LOCATION
  // =========================
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const uid = ls.get("uid");
        if (!uid) return;

        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();

          if (data?.location?.address) {
            setDefaultLocation(data.location);
          }
        }
      } catch (err) {
        console.error("Error fetching user location:", err);
      }
    };

    fetchUserLocation();
  }, []);

  // =========================
  // 🔹 TOTAL PRICE
  // =========================
  const productList = cart?.products ? Object.entries(cart.products) : [];
  let totalPrice = 0;

  productList.forEach(([id, item]) => {
    const product = productsData[id];
    if (product && !item.unavailable)
      totalPrice += item.quantity * product.price;
  });

  const isWishValid = payment === "wish" && wishRef.trim().length === 9;

  // =========================
  // 🔹 USE DEFAULT LOCATION
  // =========================
  const handleUseDefault = () => {
    if (defaultLocation) {
      setLocation(defaultLocation);
      setUseDefault(true);
    }
  };

  // =========================
  // 🔹 ORDER
  // =========================
  const handleOrder = async () => {
    const uid = ls.get("uid");

    if (!location) return alert("Please select your location");

    if (payment === "wish" && !isWishValid)
      return alert("Transaction reference must be exactly 9 characters");

    try {
      const orderDoc = await addDoc(collection(db, "orders"), {
        userId: uid,
        products: cart.products,
        location,
        paymentMethod: payment,
        paymentDetails:
          payment === "wish" ? { reference: wishRef.trim() } : null,
        paymentStatus:
          payment === "cash"
            ? "pending"
            : payment === "wish"
              ? "waiting_confirmation"
              : "pending_card",
        total: totalPrice,
        status: "pending",
        createdAt: new Date(),
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

      await setCart(uid, { userId: uid, products: {} });

      alert("Order placed!");
      // 🔻 REDUCE STOCK
      for (let [id, item] of Object.entries(cart.products)) {
        const productRef = doc(db, "products", id);

        const productSnap = await getDoc(productRef);
        if (!productSnap.exists()) continue;

        const productData = productSnap.data();

        const newStock = (productData.stock || 0) - item.quantity;

        await updateDoc(productRef, {
          stock: newStock < 0 ? 0 : newStock,
        });
      }
      setCartState({ userId: uid, products: {} });
      setLocation(null);
      setWishRef("");
      setUseDefault(false);
    } catch (error) {
      console.error("Order error:", error);
    }
  };

  if (!cart || !cart.products) return <div>Loading...</div>;

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
                  src={product?.images?.[0] || item.image}
                  alt={product?.name || item.name}
                  className="Cart-Item-img"
                />
                <h3>{product?.name || item.name}</h3>
                <p>${product?.price}</p>
                <p>Qty: {item.quantity}</p>
              </div>
              <hr />
            </div>
          );
        })}
      </div>

      {/* TOTAL */}
      <h2>Total: ${totalPrice}</h2>
      <hr />

      {/* LOCATION + PAYMENT */}
      <div className="Order-Map-Cash-Holder">
        <div className="Order-Map-Holder">
          <p>Select Delivery Location</p>

          {/* ✅ DEFAULT LOCATION OPTION */}
          {defaultLocation && !useDefault && (
            <div>
              <p>Use your saved address?</p>
              <p>
                <strong>{defaultLocation.address}</strong>
              </p>

              <button onClick={handleUseDefault}>Use this</button>
              <button onClick={() => setUseDefault(false)}>
                Choose another
              </button>
            </div>
          )}

          {/* ✅ MAP */}
          {!useDefault && (
            <div className="Order-Map">
              <MapPicker
                onSelect={(loc) => {
                  setLocation(loc);
                  setUseDefault(false);
                }}
              />
            </div>
          )}

          {/* ✅ SHOW ADDRESS */}
          {location && (
            <p>
              Selected: <strong>{location.address}</strong>
            </p>
          )}
        </div>

        {/* PAYMENT */}
        <div>
          <p>Payment Method</p>

          <select value={payment} onChange={(e) => setPayment(e.target.value)}>
            <option value="cash">Cash on Delivery</option>
            <option value="wish">Wish Transfer</option>
            <option value="card">Credit Card</option>
          </select>

          {payment === "wish" && (
            <div className="Payment-Box">
              <p>Send the total via Whish Money:</p>
              <p>
                <strong>Phone:</strong> 81284452
              </p>
              <p>
                <strong>Name:</strong> Omar Kouzi
              </p>

              <input
                type="text"
                placeholder="Transaction reference (9 chars)"
                value={wishRef}
                maxLength={9}
                onChange={(e) => setWishRef(e.target.value)}
              />

              {wishRef && wishRef.length !== 9 && (
                <p style={{ color: "red", fontSize: "12px" }}>
                  Reference must be exactly 9 characters
                </p>
              )}
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
