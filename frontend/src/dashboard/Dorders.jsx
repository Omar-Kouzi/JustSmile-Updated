import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { deleteDoc, getDoc } from "firebase/firestore";
const Dorder = () => {
  const [orders, setOrders] = useState([]);

  // 📦 Fetch all orders
  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔄 Update order status
  const updateStatus = async (id, newStatus) => {
    try {
      const orderRef = doc(db, "orders", id);

      await updateDoc(orderRef, {
        status: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 💳 Update payment status
  const updatePaymentStatus = async (id, newStatus) => {
    try {
      const orderRef = doc(db, "orders", id);

      await updateDoc(orderRef, {
        paymentStatus: newStatus,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, paymentStatus: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };
  const deleteOrder = async (orderId, userId) => {
    try {
      // 🔻 Delete order
      await deleteDoc(doc(db, "orders", orderId));

      // 🔻 Remove from user purchases
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        const updatedPurchases = (userData.purchases || []).filter(
          (p) => p.orderId !== orderId,
        );

        await updateDoc(userRef, {
          purchases: updatedPurchases,
        });
      }

      // 🔻 Update UI
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  return (
    <div className="page">
      <h1>Orders Dashboard</h1>
      <hr />

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id}>
              <div  className="Order-Card">
                <div className="Order-Data">
                  <div className="Order-Data-Holder">
                    <p className="Order-Strong">Order ID:</p> {order.id}
                  </div>
                  <div className="Order-Data-Holder">
                    <p className="Order-Strong">User: </p> {order.userId}
                  </div>
                  <div className="Order-Data-Holder">
                    <p className="Order-Strong">Total:</p> ${order.total}
                  </div>
                  <div className="Order-Data-Holder">
                    <p className="Order-Strong">Status:</p> {order.status}
                  </div>

                  {/* 💳 PAYMENT STATUS DISPLAY */}
                  <div className="Order-Data-Holder">
                    <p className="Order-Strong">Payment:</p>{" "}
                    {order.paymentStatus || "not set"}
                  </div>
                </div>

                {/* 🔘 BUTTONS */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  {/* Order Status */}
                  <button onClick={() => updateStatus(order.id, "pending")}>
                    Pending
                  </button>

                  <button onClick={() => updateStatus(order.id, "declined")}>
                    Declined
                  </button>

                  <button onClick={() => updateStatus(order.id, "finished")}>
                    Finished
                  </button>

                  <hr />

                  {/* Payment Status */}
                  <button
                    onClick={() => updatePaymentStatus(order.id, "pending")}
                  >
                    Payment Pending
                  </button>

                  <button
                    onClick={() =>
                      updatePaymentStatus(order.id, "waiting_confirmation")
                    }
                  >
                    Waiting Confirmation
                  </button>

                  <button onClick={() => updatePaymentStatus(order.id, "paid")}>
                    Paid
                  </button>

                  <button
                    onClick={() => updatePaymentStatus(order.id, "failed")}
                  >
                    Failed
                  </button>
                </div>
              </div>
              <hr />{" "}
              <button
                style={{ background: "red", color: "#fff" }}
                onClick={() => deleteOrder(order.id, order.userId)}
              >
                Delete Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dorder;
