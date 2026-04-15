import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../assets/firebase/config";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getProduct } from "../assets/firebase/firestore";

const DorderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [productsData, setProductsData] = useState({});
  const [user, setUser] = useState(null);
  // ✅ FETCH ORDER
  useEffect(() => {
    const fetchOrder = async () => {
      const ref = doc(db, "orders", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();
      setOrder(data);

      // ✅ FETCH USER
      if (data.userId) {
        const userSnap = await getDoc(doc(db, "users", data.userId));
        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      }

      // ✅ FETCH PRODUCTS
      let temp = {};
      for (let [, item] of Object.entries(data.products)) {
        if (!temp[item.productId]) {
          const product = await getProduct(item.productId);
          if (product) temp[item.productId] = product;
        }
      }

      setProductsData(temp);
    };

    fetchOrder();
  }, [id]);
  // ✅ UPDATE STATUS
  const updateStatus = async (status) => {
    await updateDoc(doc(db, "orders", id), { status });
    setOrder((prev) => ({ ...prev, status }));
  };

  // ✅ UPDATE PAYMENT
  const updatePayment = async (paymentStatus) => {
    await updateDoc(doc(db, "orders", id), { paymentStatus });
    setOrder((prev) => ({ ...prev, paymentStatus }));
  };

  // ✅ MARK VIEWED
  const markViewed = async () => {
    await updateDoc(doc(db, "orders", id), { viewed: true });
    setOrder((prev) => ({ ...prev, viewed: true }));
  };

  // ✅ DELETE
  const deleteOrder = async () => {
    await deleteDoc(doc(db, "orders", id));
    alert("Order deleted");
  };

  if (!order) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h1>Order Details</h1>
      <hr />

      {/* BASIC INFO */}
      <p>
        <strong>ID:</strong> {id}
      </p>
      <p>
        <strong>User:</strong>{" "}
        {user ? user.name || user.email || order.userId : "Loading..."}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Payment:</strong> {order.paymentStatus}
      </p>
      <p>
        <strong>Viewed:</strong> {order.viewed ? "yes" : "no"}
      </p>

      {/* ✅ SHOW WISH REF */}
      {order.paymentMethod === "wish" && (
        <p>
          <strong>Transaction ID:</strong> {order.wishRef || "N/A"}
        </p>
      )}

      <hr />

      {/* ✅ PRODUCTS */}
      <h2>Products</h2>
      {Object.entries(order.products).map(([key, item]) => {
        const product = productsData[item.productId];
        if (!product) return null;

        return (
          <div key={key} className="Cart-Item-Data">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="Cart-Item-img"
            />

            <div>
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Size: {item.size}</p>
              <p>Qty: {item.quantity}</p>
            </div>
          </div>
        );
      })}

      <hr />

      {/* ✅ ACTIONS */}
      <h2>Actions</h2>

      <button onClick={markViewed}>Mark Viewed</button>

      <h3>Status</h3>
      <button onClick={() => updateStatus("pending")}>Pending</button>
      <button onClick={() => updateStatus("packing")}>Packing</button>
      <button onClick={() => updateStatus("on_the_way")}>On The Way</button>
      <button onClick={() => updateStatus("finished")}>Delivered</button>
      <button onClick={() => updateStatus("declined")}>Declined</button>

      <h3>Payment</h3>
      <button onClick={() => updatePayment("pending")}>Pending</button>
      <button onClick={() => updatePayment("waiting_confirmation")}>
        Waiting Confirmation
      </button>
      <button onClick={() => updatePayment("paid")}>Paid</button>
      <button onClick={() => updatePayment("failed")}>Failed</button>

      <hr />

      <button
        onClick={deleteOrder}
        style={{ background: "red", color: "#fff" }}
      >
        Delete Order
      </button>
    </div>
  );
};

export default DorderDetails;
