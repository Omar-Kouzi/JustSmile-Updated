import { useEffect, useState } from "react";
import { getProducts } from "../assets/firebase/firestore";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const navigate = useNavigate();

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
      // 🔥 Always push unavailable to bottom
      if (a.stock === 0 && b.stock > 0) return 1;
      if (a.stock > 0 && b.stock === 0) return -1;

      // Then apply your selected sorting
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
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="Custom-Dropdown">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort By</option>
              <option value="price-asc">Price ↑</option>
              <option value="price-desc">Price ↓</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

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
            <div className="Product-Image-Wrap">
              <img
                src={product.images?.[0] || "placeholder-image.jpg"}
                alt={product.name}
                className="Product-Card-img primary-img"
              />
              {product.images?.[1] && (
                <img
                  src={product.images[1]}
                  alt={product.name}
                  className="Product-Card-img hover-img"
                />
              )}
            </div>

            <div className="Product-Card-Name">
              <p>{product.name}</p>
              <p>${product.price}</p>
            </div>

            <button
              className="Product-Card-Button"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              view more
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
