import { useEffect, useState } from "react";
import { db, auth } from "../assets/firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Contact = () => {
  const [user, setUser] = useState(null);
  const [homeImg, setHomeImg] = useState(""); // 🔥 image from settings/home

  const [form, setForm] = useState({
    name: "",
    message: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // 🔹 Check auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.email) {
        setForm((prev) => ({ ...prev, email: u.email }));
      }
    });

    return () => unsub();
  }, []);

  // 🔥 Fetch image from settings/home
  useEffect(() => {
    const fetchHomeImage = async () => {
      try {
        const ref = doc(db, "settings", "home");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          // change this if your field name is different
          setHomeImg(data.background || "");
        }
      } catch (error) {
        console.error("Error fetching home image:", error);
      }
    };

    fetchHomeImage();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user && !form.email && !form.phone) {
      alert("Please provide email or phone");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "emails"), {
        name: form.name,
        message: form.message,
        email: user?.email || form.email || null,
        phone: form.phone || null,
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
      });

      setSuccess("Message sent successfully!");
      setForm({
        name: "",
        message: "",
        email: user?.email || "",
        phone: "",
      });
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page Contact-Page">
      <h1 style={{
        margin:"10px"
      }}>Contact Us</h1>

      <div className="contact-img-pc">
        {/* 🔥 Dynamic Image */}
        {homeImg && <img src={homeImg} alt="contact"  className="Contact-img"/>}

        <form onSubmit={handleSubmit} className="Contact-Form">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            disabled={!!user}
          />

          {!user && (
            <input
              type="text"
              name="phone"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={handleChange}
            />
          )}

          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            required
            style={{ height: "300px" ,padding:"10px"}}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </button>

          {success && <p>{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default Contact;
