import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dorder = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

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
              <div className="Order-Card">
                <div className="Order-Data">
                  <p>
                    <strong>Order ID:</strong> {order.id}
                  </p>
                  <p>
                    <strong>User:</strong> {order.userId}
                  </p>
                  <p>
                    <strong>Total:</strong> ${order.total}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Viewed:</strong> {order.viewed ? "yes" : "no"}
                  </p>
                  <p>
                    <strong>Payment:</strong> {order.paymentStatus}
                  </p>
                </div>

                {/* ✅ ONLY BUTTON LEFT */}
                <button
                  onClick={() => navigate(`/dashboard/Dorder/${order.id}`)}
                >
                  View Details
                </button>
              </div>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dorder;
