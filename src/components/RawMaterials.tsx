import { useEffect, useState, useRef } from "react";
import axios, { type AxiosResponse } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface RawMaterial {
  id: number;
  name: string;
  stockQuantity: number;
}

function RawMaterials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [form, setForm] = useState<{ id?: number; name: string; stockQuantity: string }>({
    name: "",
    stockQuantity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res: AxiosResponse<RawMaterial[]> = await axios.get(`${API_URL}/raw-materials`);
      setMaterials(res.data);
    } catch (err) {
      setError("Failed to fetch raw materials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (!form.name || !form.stockQuantity) {
      setError("Please fill all fields");
      return;
    }

    const stockQuantity = parseInt(form.stockQuantity);

    if (isNaN(stockQuantity) || stockQuantity <= 0) {
      setError("Stock quantity must be a positive number");
      return;
    }

    const materialData = {
      name: form.name,
      stockQuantity: stockQuantity
    };

    try {
      if (form.id) {
        await axios.put(`${API_URL}/raw-materials/${form.id}`, materialData);
      } else {
        await axios.post(`${API_URL}/raw-materials`, materialData);
      }
      setForm({ name: "", stockQuantity: "" });
      fetchMaterials();
    } catch (err) {
      setError("Failed to save raw material");
      console.error(err);
    }
  };

  const handleEdit = (material: RawMaterial) => {
    setForm({ 
      id: material.id, 
      name: material.name, 
      stockQuantity: material.stockQuantity.toString() 
    });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;
    try {
      await axios.delete(`${API_URL}/raw-materials/${id}`);
      fetchMaterials();
    } catch (err) {
      setError("Failed to delete raw material");
      console.error(err);
    }
  };

  return (
    <div className="component-card">
      <h1>Raw Materials</h1>

      <form onSubmit={handleSubmit} data-cy="raw-material-form">
        <input
          data-cy="raw-material-name-input"
          type="text"
          name="name"
          placeholder="Material Name (ex: Wood)"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          data-cy="raw-material-quantity-input"
          type="number"
          name="stockQuantity"
          placeholder="Stock Quantity (ex: 100)"
          value={form.stockQuantity}
          onChange={handleChange}
          min="1"
          required
        />
        <button type="submit" data-cy="submit-raw-material-btn">
          {form.id ? "Update" : "Add"}
        </button>
        {form.id && (
          <button
            type="button"
            data-cy="cancel-btn"
            onClick={() => setForm({ name: "", stockQuantity: "" })}
          >
            Cancel
          </button>
        )}
      </form>

      {loading && <p data-cy="loading">Loading...</p>}
      {error && <p className="error" data-cy="error-message" style={{ color: 'rgb(255, 0, 0)' }}>{error}</p>}

      <div 
        ref={tableContainerRef}
        className="table-container"
        data-cy="raw-materials-list"
        style={{
          maxHeight: materials.length >= 3 ? '400px' : 'none',
          overflowY: materials.length >= 3 ? 'auto' : 'visible',
          border: materials.length >= 3 ? '1px solid #e1e4f0' : 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        <table>
          <thead style={materials.length >= 3 ? { position: 'sticky', top: 0, background: '#f8f9fc', zIndex: 1 } : {}}>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Stock Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 && !loading ? (
              <tr data-cy="empty-state">
                <td colSpan={4} style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>
                  No raw materials found. Create one above.
                </td>
              </tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id} data-cy="raw-material-row">
                  <td>{m.id}</td>
                  <td data-cy="raw-material-name" data-testid="raw-material-name">{m.name}</td>
                  <td data-cy="raw-material-stock" data-testid="raw-material-stock">{m.stockQuantity}</td>
                  <td>
                    <div className="actions">
                      <button className="edit-btn" data-cy="edit-raw-material-btn" onClick={() => handleEdit(m)}>Edit</button>
                      <button className="delete-btn" data-cy="delete-raw-material-btn" onClick={() => handleDelete(m.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RawMaterials;