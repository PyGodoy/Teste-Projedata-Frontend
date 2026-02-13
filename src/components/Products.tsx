import { useEffect, useState } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<{ id?: number; name: string; price: number; quantity: number }>({
    name: "",
    price: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch products
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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "name" ? value : Number(value) });
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (form.id) {
        // Update existing product
        await axios.put(`http://localhost:8080/products/${form.id}`, form);
      } else {
        // Create new product
        await axios.post("http://localhost:8080/products", form);
      }
      setForm({ name: "", price: 0, quantity: 0 });
      fetchProducts();
    } catch (err) {
      setError("Failed to save product");
      console.error(err);
    }
  };

  // Edit a product
  const handleEdit = (product: Product) => {
    setForm({ id: product.id, name: product.name, price: product.price, quantity: product.quantity });
  };

  // Delete a product
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
    <div>
      <h1>Products</h1>

      {/* Product Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
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
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <button type="submit">{form.id ? "Update" : "Add"}</button>
        {form.id && <button type="button" onClick={() => setForm({ name: "", price: 0, quantity: 0 })}>Cancel</button>}
      </form>

      {/* Loading / Error */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Products List */}
      <table border={1} cellPadding={10}>
        <thead>
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
              <td>{p.price}</td>
              <td>{p.quantity}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Products;
