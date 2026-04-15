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

  // ✅ NEW: calculate total stock (sizes OR fallback)
  const getTotalStock = (product) => {
    if (product.sizes && typeof product.sizes === "object") {
      return Object.values(product.sizes).reduce(
        (sum, qty) => sum + Number(qty || 0),
        0
      );
    }
    return product.stock || 0;
  };

  const processedProducts = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )

    // ✅ FIXED availability filter
    .filter((p) =>
      availableOnly ? getTotalStock(p) > 0 : true
    )

    .sort((a, b) => {
      const stockA = getTotalStock(a);
      const stockB = getTotalStock(b);

      // ✅ FIXED stock priority
      if (stockA === 0 && stockB > 0) return 1;
      if (stockA > 0 && stockB === 0) return -1;

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
              style={{ width: "25px" }}
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
        {processedProducts.map((product) => {
          const totalStock = getTotalStock(product); // ✅ use here

          return (
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

                {/* ✅ FIXED UNAVAILABLE */}
                {totalStock === 0 && (
                  <div className="Product-Unavailable">
                    UNAVAILABLE
                  </div>
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
          );
        })}
      </div>
    </div>
  );
};

export default Products;