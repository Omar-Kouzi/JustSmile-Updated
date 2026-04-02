import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../assets/firebase/config";
import { getProduct, setCart } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const PurchaseDetails = () => {
  const { id } = useParams(); // orderId
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [productsData, setProductsData] = useState({});

  // Fetch order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", id);
        const snap = await getDoc(orderRef);

        if (!snap.exists()) {
          console.log("Order not found");
          return;
        }

        const data = snap.data();
        setOrder(data);

        // Fetch products info
        let temp = {};
        for (let [productId] of Object.entries(data.products)) {
          const product = await getProduct(productId);
          if (product) temp[productId] = product;
        }

        setProductsData(temp);
      } catch (err) {
        console.error("Error fetching order:", err);
      }
    };

    fetchOrder();
  }, [id]);

  // Calculate total
  let total = 0;
  if (order?.products) {
    Object.entries(order.products).forEach(([id, item]) => {
      const product = productsData[id];
      if (product) {
        total += product.price * item.quantity;
      }
    });
  }

  // 🔁 Reorder
  const handleReorder = async () => {
    try {
      const uid = ls.get("uid");
      if (!uid) return;

      await setCart(uid, {
        userId: uid,
        products: order.products,
      });

      navigate("/order");
    } catch (err) {
      console.error("Reorder error:", err);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className=" Purchase-Page page">
      <h1>Purchase Details</h1>
      <hr />
      <div className="Purchase-Id">
        <p>
          <strong>Order ID:</strong> {id}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
      </div>

      <hr />

      {/* Products */}
      <div>
        {Object.entries(order.products).map(([id, item]) => {
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
                <div className="Cart-Item-info">
                  <h3>{product.name}</h3>
                  <p>Price: ${product.price}</p>
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
              <hr />
            </div>
          );
        })}
      </div>

      <h2>Total: ${total}</h2>

      <br />

      <button
        onClick={handleReorder}
        style={{
          position: "relative",
          left: "39%",
          marginBottom: "10px",
        }}
      >
        Order Again
      </button>
    </div>
  );
};

export default PurchaseDetails;
