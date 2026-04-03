import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getProducts } from "../assets/firebase/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../assets/firebase/config";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const [aboutText, setAboutText] = useState("");
  const [aboutImg, setAboutImg] = useState("");

  const [logo, setLogo] = useState(""); // home logo
  const [background, setBackground] = useState(""); // carousel background
  const [title, setHomeTitle] = useState(""); // carousel background

  const navigate = useNavigate();

  // 🔹 Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // 🔹 Fetch About data
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const refDoc = doc(db, "settings", "about");
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const data = snap.data();
          setAboutText(data.homeText || "");
          setAboutImg(data.img1 || "");
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
      }
    };
    fetchAbout();
  }, []);

  // 🔹 Fetch Home settings (logo + background)
  useEffect(() => {
    const fetchHome = async () => {
      try {
        const refDoc = doc(db, "settings", "home");
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          const data = snap.data();
          setLogo(data.logo || "");
          setBackground(data.background || "");
          setHomeTitle(data.title);
        }
      } catch (error) {
        console.error("Error fetching home settings:", error);
      }
    };
    fetchHome();
  }, []);

  // 🔥 Fade animation logic for carousel
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setFade(false); // fade out

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setFade(true); // fade in
      }, 800);
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  return (
    <div className="Home-Page page">
      {/* ===== Home Carousel ===== */}
      <section
        className="Home-Carousel"
        style={{
          backgroundImage: background ? `url(${background})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="Home-Carousel-Data">
          <div>
            {logo && (
              <img className="Home-Carousel-img" src={logo} alt="Logo" />
            )}
            <h1 style={{ fontSize: "50px" }}>{title}</h1>
          </div>

          {/* 🔥 Animated product name */}
          <p
            className={`Home-Carousel-Categories ${fade ? "fade-in" : "fade-out"}`}
          >
            {products[currentIndex]?.name || "Loading..."}
          </p>

          <div className="Home-Carousel-Buttens">
            <button onClick={() => navigate("/products")}>more</button>
            <button onClick={() => navigate("/about")}>about</button>
          </div>
        </div>
      </section>

      {/* ===== About Section ===== */}
      <section className="Home-About">
        {aboutImg && (
          <img src={aboutImg} alt="About" className="Home-About-img" />
        )}
        <div className="Home-About-Data">
          <h1>About</h1>
          <p>{aboutText || "Loading about text..."}</p>
        </div>
      </section>

      {/* ===== Products Section ===== */}
      <section className="Home-Products">
        <h1>Products</h1>
        <div className="Home-Products-Grid">
          <div className="Home-Products-Cards">
            {products.map((product) => (
              <div key={product.id} className="Product-Card">
                <div className="Product-Image-Wrap">
                  <img
                    src={product.images?.[0] || "placeholder-image.jpg"}
                    alt={product.name}
                    className="primary-img"
                  />
                  {product.images?.[1] && (
                    <img
                      src={product.images[1]}
                      alt={`${product.name}-hover`}
                      className="hover-img"
                    />
                  )}
                </div>

                <p>{product.name}</p>

                <button
                  className="Product-Card-Button"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  view more
                </button>
              </div>
            ))}
          </div>

          <button
            style={{
              height: "40px",
              width: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate("/products")}
          >
            <FaArrowRight />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
