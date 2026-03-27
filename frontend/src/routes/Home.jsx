const Home = () => {
  return (
    <div className="Home-Page">
      <section className="Home-Carousel">
        <h1>Just Smile</h1>
        <p>shape shifting name thing</p>
      </section>
      <section className="Home-Products">
        <h1>Products</h1>
        <div>
          <div className="Product-Card">
            <img src="on hover new image" alt="" className="Product-Card-img"/>
            <p >product name</p>
            <button className="Product-Card-Button">view more</button>
          </div>
        </div>
      </section>
      <section className="Home-About">about</section>
    </div>
  );
};

export default Home;
