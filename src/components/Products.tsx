import { useEffect, useState, useRef } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ id?: number; name: string; price: string; quantity: string }>({
    name: "",
    price: "",
    quantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<Product[]> = await axios.get("http://localhost:8080/products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (!form.name || !form.price || !form.quantity) {
      setError("Please fill all fields");
      return;
    }

    const price = parseFloat(form.price);
    const quantity = parseInt(form.quantity);

    if (isNaN(price) || price <= 0) {
      setError("Price must be a positive number");
      return;
    }

    if (isNaN(quantity) || quantity <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    const productData = {
      name: form.name,
      price: price,
      quantity: quantity
    };

    try {
      if (form.id) {
        await axios.put(`http://localhost:8080/products/${form.id}`, productData);
      } else {
        await axios.post("http://localhost:8080/products", productData);
      }
      setForm({ name: "", price: "", quantity: "" });
      fetchProducts();
    } catch (err) {
      setError("Failed to save product");
      console.error(err);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({ 
      id: product.id, 
      name: product.name, 
      price: product.price.toString(), 
      quantity: product.quantity.toString() 
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8080/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product");
      console.error(err);
    }
  };

  return (
    <div className="component-card">
      <h1>Products</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price (ex: 99.90)"
          value={form.price}
          onChange={handleChange}
          step="0.01"
          min="0"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity (ex: 10)"
          value={form.quantity}
          onChange={handleChange}
          min="0"
          required
        />
        <button type="submit">{form.id ? "Update" : "Add"}</button>
        {form.id && (
          <button 
            type="button" 
            onClick={() => setForm({ name: "", price: "", quantity: "" })}
          >
            Cancel
          </button>
        )}
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error" style={{ color: 'rgb(255, 0, 0)' }}>{error}</p>}

      <div 
        ref={tableContainerRef}
        className="table-container"
        style={{
          maxHeight: products.length >= 3 ? '400px' : 'none',
          overflowY: products.length >= 3 ? 'auto' : 'visible',
          border: products.length >= 3 ? '1px solid #e1e4f0' : 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        <table>
          <thead style={products.length >= 3 ? { position: 'sticky', top: 0, background: '#f8f9fc', zIndex: 1 } : {}}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <div className="actions">
                    <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length >= 3 && (
        <p style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.875rem', 
          color: '#64748b',
          textAlign: 'right'
        }}>
          Showing {products.length} products (scroll enabled)
        </p>
      )}
    </div>
  );
}

export default Products;