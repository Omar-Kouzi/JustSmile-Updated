import { useEffect, useState } from "react";
import { getProducts } from "../assets/firebase/firestore"; // your Firestore utility
import Logo from "../assets/Logo.png";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        // Shuffle the array to get random items
        const shuffled = allProducts.sort(() => 0.5 - Math.random());

        // Pick first 4
        setProducts(shuffled.slice(0, 3));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="Home-Page page">
      <section className="Home-Carousel">
        <div className="Home-Carousel-Data">
          <div>
            <img className="Home-Carousel-img" src={Logo} alt="" />
            <h1 style={{ fontSize: "50px" }}>Just Smile</h1>
          </div>
          <p className="Home-Carousel-Categories">shape shifting name thing</p>
          <div className="Home-Carousel-Buttens">
            <button>more</button> <button>about</button>
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
          {products.map((product) => (
            <div key={product.id} className="Product-Card">
              <img
                src={product.image || "placeholder-image.jpg"}
                alt={product.name}
                className="Product-Card-img"
              />
              <p>{product.name}</p>
              <button className="Product-Card-Button">view more</button>
            </div>
          ))}
          <button style={{ height: "40px", width: "40px" }}>h</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
