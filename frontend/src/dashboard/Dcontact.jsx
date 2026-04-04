import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const Dcontact = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch emails
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const q = query(collection(db, "emails"), orderBy("createdAt", "desc"));

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setEmails(data);
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="Dcontact page">
      <h1>Messages</h1>

      {emails.length === 0 && <p>No messages yet</p>}

      <div className="Dcontact-List">
        {emails.map((item) => (
          <div key={item.id} className="Dcontact-Card">
            {/* 🔹 Main Info */}
            <div className="Dcontact-Header">
              <p>
                <strong>Name:</strong> {item.name || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {item.email || "N/A"}
              </p>
              <p>
                <strong>Phone:</strong> {item.phone || "N/A"}
              </p>
            </div>

            {/* 🔹 Expandable Message */}
            <hr />
            <details>
              <summary style={{ cursor: "pointer", marginTop: "5px" }}>
                Show More
              </summary>

              <div className="Dcontact-Message">
                <p>
                  <strong>Message:</strong>
                </p>
                <p style={{
                  border:"1px solid"
                  ,padding:"10px"
                }}>{item.message}</p>

                {item.createdAt?.toDate && (
                  <p style={{ opacity: 0.6, marginTop: "10px" }}>
                    {item.createdAt.toDate().toLocaleString()}
                  </p>
                )}
              </div>
            </details>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dcontact;
