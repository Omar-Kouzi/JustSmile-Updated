import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../assets/firebase/config";

const About = () => {
  const [homeText, setHomeText] = useState("");
  const [aboutMain, setAboutMain] = useState("");
  const [aboutSub, setAboutSub] = useState("");
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");

  // 🔹 Fetch About data
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const ref = doc(db, "settings", "about");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setHomeText(data.homeText || "");
          setAboutMain(data.aboutMain || "");
          setAboutSub(data.aboutSub || "");
          setImg1(data.img1 || "");
          setImg2(data.img2 || "");
        }
      } catch (error) {
        console.error("Error fetching about:", error);
      }
    };

    fetchAbout();
  }, []);

  return (
    <div className="About-Page page">
      <h1 style={{ margin: "10px" }}>About Us</h1>
      <hr />
      {/* 🔹 Hero / Intro */}
      <section className="About-Section-one About-Section">
        <p>{homeText || "Loading..."}</p>
        {img1 && <img src={img1} alt="about-1" className="About-Image" />}
      </section>
      {/* 🔹 Main Section */}
      <section className="About-Section-two About-Section">
        {img2 && <img src={img2} alt="about-2" className="About-Image" />}
        <p>{aboutMain || "Loading..."}</p>
      </section>
      <p className="About-Sub">{aboutSub || "Loading..."}</p>
    </div>
  );
};

export default About;
