import { useEffect, useState } from "react";
import { db } from "../assets/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Dabout = () => {
  const [homeText, setHomeText] = useState("");
  const [aboutMain, setAboutMain] = useState("");
  const [aboutSub, setAboutSub] = useState("");
  const [img1, setImg1] = useState(""); // Existing URL
  const [img2, setImg2] = useState("");
  const [file1, setFile1] = useState(null); // New file
  const [file2, setFile2] = useState(null);

  const storage = getStorage();

  const fetchData = async () => {
    const refDoc = doc(db, "settings", "about");
    const snap = await getDoc(refDoc);

    if (snap.exists()) {
      const data = snap.data();
      setHomeText(data.homeText || "");
      setAboutMain(data.aboutMain || "");
      setAboutSub(data.aboutSub || "");
      setImg1(data.img1 || "");
      setImg2(data.img2 || "");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (file, name) => {
    if (!file) return null;

    const storageRef = ref(storage, `about/${name}-${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  };

  const handleSave = async () => {
    try {
      const uploadedImg1 = file1 ? await handleFileUpload(file1, "img1") : img1;
      const uploadedImg2 = file2 ? await handleFileUpload(file2, "img2") : img2;

      await setDoc(doc(db, "settings", "about"), {
        homeText,
        aboutMain,
        aboutSub,
        img1: uploadedImg1,
        img2: uploadedImg2,
      });

      alert("Updated!");
      setFile1(null);
      setFile2(null);
    } catch (err) {
      console.error("Error saving about:", err);
      alert("Failed to save, try again.");
    }
  };

  const handleRemoveFile = (index) => {
    if (index === 0) setFile1(null);
    else setFile2(null);
  };

  return (
    <div className="Dabout-page page">
      <h1>About Settings</h1>

      <textarea
        placeholder="Home Text"
        value={homeText}
        onChange={(e) => setHomeText(e.target.value)}
      />
      <textarea
        placeholder="About Main"
        value={aboutMain}
        onChange={(e) => setAboutMain(e.target.value)}
      />
      <textarea
        placeholder="About Sub"
        value={aboutSub}
        onChange={(e) => setAboutSub(e.target.value)}
      />

      {/* Image 1 */}
      <div>
        <p>Image 1</p>
        {(file1 || img1) && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: "5px" }}>
            <img
              src={file1 ? URL.createObjectURL(file1) : img1}
              alt="preview1"
              style={{ width: "150px", borderRadius: "5px" }}
            />
            {file1 && (
              <button
                onClick={() => handleRemoveFile(0)}
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  width: "20px",
                  height: "20px",
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile1(e.target.files[0])} />
      </div>

      {/* Image 2 */}
      <div>
        <p>Image 2</p>
        {(file2 || img2) && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: "5px" }}>
            <img
              src={file2 ? URL.createObjectURL(file2) : img2}
              alt="preview2"
              style={{ width: "150px", borderRadius: "5px" }}
            />
            {file2 && (
              <button
                onClick={() => handleRemoveFile(1)}
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  width: "20px",
                  height: "20px",
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile2(e.target.files[0])} />
      </div>

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Dabout;