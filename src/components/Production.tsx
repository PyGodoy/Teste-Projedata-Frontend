import { useEffect, useState } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

interface ProductionProduct {
  name: string;
  quantity: number;
  price: number;
}

interface ProductionResponse {
  products: ProductionProduct[];
  totalValue: number;
}

function Production() {
  const [products, setProducts] = useState<ProductionProduct[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduction = () => {
    setLoading(true);
    setError(null);

    axios
      .get<ProductionResponse>("http://localhost:8080/production")
      .then((res: AxiosResponse<ProductionResponse>) => {
        setProducts(res.data.products);
        setTotalValue(res.data.totalValue);
      })
      .catch((err: AxiosError) => {
        console.error(err);
        setError("Failed to fetch production data.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProduction();
  }, []);

  return (
    <div>
      <h1>Production Suggestion</h1>
      <button onClick={fetchProduction} style={{ marginBottom: "20px" }}>
        Refresh Production
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p>No products can be produced with current raw materials.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
                  Product
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
                  Quantity
                </th>
                <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
                  Price per unit
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, index) => (
                <tr key={index}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                    {p.name}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                    {p.quantity}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "8px" }}>
                    ${p.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 style={{ marginTop: "20px" }}>
            Total Value: ${totalValue.toFixed(2)}
          </h2>
        </>
      )}
    </div>
  );
}

export default Production;
