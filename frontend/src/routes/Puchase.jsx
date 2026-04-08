import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../assets/firebase/config";
import { getProduct, setCart } from "../assets/firebase/firestore";
import SecureLS from "secure-ls";

const ls = new SecureLS({ encodingType: "aes" });

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [productsData, setProductsData] = useState({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderRef = doc(db, "orders", id);
        const snap = await getDoc(orderRef);

        if (!snap.exists()) return;

        const data = snap.data();
        setOrder(data);

        let temp = {};

        for (let [productId] of Object.entries(data.products)) {
          const product = await getProduct(productId);
          if (product) temp[productId] = product;
        }

        setProductsData(temp);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
  }, [id]);

  // progress step
  const getStep = (status) => {
    switch (status) {
      case "pending":
        return 1;
      case "packing":
        return 2;
      case "on_the_way":
        return 3;
      case "finished":
        return 4;
      default:
        return 1;
    }
  };

  const step = getStep(order?.status);

  let total = 0;

  if (order?.products) {
    Object.entries(order.products).forEach(([id, item]) => {
      const product = productsData[id];
      if (product) {
        total += product.price * item.quantity;
      }
    });
  }

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
      console.error(err);
    }
  };

  if (!order) return <div className="page">Loading...</div>;

  return (
    <div className="Purchase-Page page">
      <h1>Purchase Details</h1>
      <hr />

      <div className="Purchase-Id">
        <p>
          <strong>Order ID:</strong> {id}
        </p>

        <p>
          <strong>Status:</strong> {order.status}
        </p>

        <p>
          <strong>Payment:</strong> {order.paymentStatus}
        </p>
      </div>

      {/* PROGRESS BAR */}
      <div className="Order-Progress">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div className="circle">1</div>
          <p>Pending</p>
        </div>

        <div className={`line ${step >= 2 ? "active" : ""}`} />

        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div className="circle">2</div>
          <p>Packing</p>
        </div>

        <div className={`line ${step >= 3 ? "active" : ""}`} />

        <div className={`step ${step >= 3 ? "active" : ""}`}>
          <div className="circle">3</div>
          <p>On The Way</p>
        </div>

        <div className={`line ${step >= 4 ? "active" : ""}`} />

        <div className={`step ${step >= 4 ? "active" : ""}`}>
          <div className="circle">4</div>
          <p>Delivered</p>
        </div>
      </div>

      <hr />

      {/* PRODUCTS */}
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