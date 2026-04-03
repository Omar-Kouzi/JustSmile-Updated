import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { getProducts } from "../assets/firebase/firestore";
import Logo from "../assets/Logo.png";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 Fade animation logic
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
      <section className="Home-Carousel">
        <div className="Home-Carousel-Data">
          <div>
            <img className="Home-Carousel-img" src={Logo} alt="Logo" />
            <h1 style={{ fontSize: "50px" }}>Just Smile</h1>
          </div>

          {/* 🔥 Animated product name */}
          <p
            className={`Home-Carousel-Categories ${fade ? "fade-in" : "fade-out"}`}
          >
            {products[currentIndex]?.name || "Loading..."}
          </p>

          <div className="Home-Carousel-Buttens">
            <button onClick={() => navigate("/products")}>more</button>
            <button>about</button>
          </div>
        </div>
      </section>

      <section className="Home-About">
        <img src="sdj" alt="" className="Home-About-img" />
        <div className="Home-About-Data">
          <h1>About</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt
            sequi fuga nobis perferendis. Aut, eligendi vitae eius provident
            nobis, placeat voluptatibus totam quam quo nam facilis laborum minus
            tempore minima.
          </p>
        </div>
      </section>

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
