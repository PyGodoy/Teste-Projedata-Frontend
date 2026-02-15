import { useEffect, useState } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

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
      .get<ProductionResponse>(`${API_URL}/production`)
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
    <div className="component-card" data-cy="production-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Production Suggestion</h1>
        <button onClick={fetchProduction} data-cy="refresh-btn">
          Refresh Production
        </button>
      </div>

      {loading && <p data-cy="loading">Loading...</p>}
      {error && <p className="error" style={{ color: 'rgb(255, 0, 0)' }} data-cy="error-message">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p data-cy="empty-state">No products can be produced with current raw materials.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <>
          <div 
            className="table-container"
            data-cy="production-table-container"
            style={{
              maxHeight: products.length >= 3 ? '300px' : 'none',
              overflowY: products.length >= 3 ? 'scroll' : 'visible',
              border: products.length >= 3 ? '1px solid #e1e4f0' : 'none',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}
          >
            <table style={{ 
              margin: 0,
              width: '100%'
            }}
            data-cy="production-table"
            >
              <thead style={products.length >= 3 ? { 
                position: 'sticky', 
                top: 0, 
                background: '#f8f9fc', 
                zIndex: 1,
                boxShadow: '0 1px 0 #e1e4f0'
              } : {}}>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price per unit</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={index} data-cy="production-row">
                    <td data-cy="product-name">{p.name}</td>
                    <td data-cy="product-quantity">{p.quantity}</td>
                    <td data-cy="product-price">${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="total-value" data-cy="total-value">
            <h2>Total Value: ${totalValue.toFixed(2)}</h2>
          </div>
        </>
      )}
    </div>
  );
}

export default Production;