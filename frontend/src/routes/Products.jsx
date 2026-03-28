import { useEffect, useState } from "react";
import { getProducts } from "../assets/firebase/firestore";
import { NavLink } from "react-router-dom";
const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 FILTER + SORT
  const processedProducts = products
    .filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => (availableOnly ? p.stock > 0 : true))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="Products-page page">
      <details className="Filter-Wraper">
        <summary>filter</summary>
        <div className="Filter">
          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* SORT DROPDOWN */}
          <div className="Custom-Dropdown">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort By</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* AVAILABILITY */}
          <label>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            In Stock Only
          </label>
        </div>
      </details>
      <hr />
      <h1>Products</h1>

      <div className="Products-Grid">
        {processedProducts.map((product) => (
          <div key={product.id} className="Product-Card">
            <img
              src={product.image || "placeholder-image.jpg"}
              alt={product.name}
              className="Product-Card-img"
            />

            <div className="Product-Card-Name">
              <p>{product.name}</p>
              <p>${product.price}</p>
            </div>

            <button className="Product-Card-Button">
              {" "}
              <NavLink to={`/product/${product.id}`}>view more</NavLink>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
