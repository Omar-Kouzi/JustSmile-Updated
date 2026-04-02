import { useEffect, useState } from "react";
import SecureLS from "secure-ls";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../assets/firebase/config";
import { useNavigate } from "react-router-dom";
import MapPicker from "../components/Mappicker"; // Add this

const ls = new SecureLS({ encodingType: "aes" });

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState({
    name: false,
    phone: false,
    location: false,
  });
  const [tempData, setTempData] = useState({});
  const navigate = useNavigate();

  const uid = ls.get("uid");
  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      const userRef = doc(db, "users", uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
        setTempData(docSnap.data());
      }
    };
    fetchUser();
  }, [uid]);

  const handleSave = async (field) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { [field]: tempData[field] });
      setUser({ ...user, [field]: tempData[field] });
      setEditing({ ...editing, [field]: false });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!user) return <div>Loading...</div>;
  const getAddressFromCoords = (lat, lng) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          resolve(results[0]);
        } else {
          reject("Geocoder failed: " + status);
        }
      });
    });
  };
  return (
    <div className="page">
      <h1>Profile</h1>
      <hr />

      <div className="user-info">
        <div>
          <h3>Name:</h3>
          {editing.name ? (
            <>
              <input
                value={tempData.name}
                onChange={(e) =>
                  setTempData({ ...tempData, name: e.target.value })
                }
              />
              <button onClick={() => handleSave("name")}>Save</button>
            </>
          ) : (
            <>
              <p>{user.name}</p>
              <button onClick={() => setEditing({ ...editing, name: true })}>
                Edit
              </button>
            </>
          )}
        </div>
        <div>
          <h3>Email:</h3>
          <p>{user.email}</p>
        </div>
        <div>
          <h3>Phone:</h3>
          {editing.phone ? (
            <>
              <input
                value={tempData.phone}
                onChange={(e) =>
                  setTempData({ ...tempData, phone: e.target.value })
                }
              />
              <button onClick={() => handleSave("phone")}>Save</button>
            </>
          ) : (
            <>
              <p>{user.phone}</p>
              <button onClick={() => setEditing({ ...editing, phone: true })}>
                Edit
              </button>
            </>
          )}
        </div>
        <div>
          <h3>Location:</h3>
          {editing.location ? (
            <div className="Order-Map">
              <MapPicker
                onSelect={async (loc) => {
                  try {
                    const result = await getAddressFromCoords(loc.lat, loc.lng);

                    const address = result.formatted_address;

                    setTempData({
                      ...tempData,
                      location: {
                        lat: loc.lat,
                        lng: loc.lng,
                        address, // ✅ store readable address
                      },
                    });
                  } catch (err) {
                    console.error(err);
                  }
                }}
                defaultLocation={user.location || { lat: 0, lng: 0 }}
              />
              <button onClick={() => handleSave("location")}>Save</button>
            </div>
          ) : user.location ? (
            <p >{user.location.address}</p>
          ) : (
            <p>No location set.</p>
          )}
          {!editing.location && (
            <button onClick={() => setEditing({ ...editing, location: true })}>
              Edit Location
            </button>
          )}
        </div>
      </div>

      <hr />
      <h2>Past Purchases</h2>
      <div className="purchases">
        {user.purchases?.length > 0 ? (
          user.purchases.map((p, i) => (
            <div key={i}>
              <div className="purchase-card">
                <p className="purchase-card-id">
                  Order ID: {p.orderId || "N/A"}
                </p>
                <p className="purchase-card-status">
                  Status: {p.status || "N/A"}
                </p>
                <button
                  className="purchase-card-button"
                  onClick={() => navigate(`/purchasedetail/${p.orderId}`)}
                >
                  View Details
                </button>
              </div>
              <hr />
            </div>
          ))
        ) : (
          <p>No purchases yet</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
