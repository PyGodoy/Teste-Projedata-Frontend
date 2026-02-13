import { useEffect, useState, type FormEvent, useRef } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

interface RawMaterial {
  id: number;
  name: string;
  stockQuantity: number;
}

function RawMaterials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [name, setName] = useState("");
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const API_URL = "http://localhost:8080/raw-materials";

  const fetchMaterials = () => {
    axios
      .get<RawMaterial[]>(API_URL)
      .then((res: AxiosResponse<RawMaterial[]>) => setMaterials(res.data))
      .catch((err: AxiosError) => {
        console.error(err);
        setError("Failed to fetch raw materials");
      });
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !stockQuantity) {
      setError("Please fill all fields");
      return;
    }

    const quantity = parseInt(stockQuantity);
    
    if (isNaN(quantity) || quantity <= 0) {
      setError("Stock quantity must be a positive number");
      return;
    }

    const payload = { name, stockQuantity: quantity };

    if (editId === null) {
      // Criar
      axios
        .post<RawMaterial>(API_URL, payload)
        .then(() => {
          fetchMaterials();
          setName("");
          setStockQuantity("");
          setError("");
        })
        .catch((err: AxiosError) => {
          console.error(err);
          setError("Failed to create raw material");
        });
    } else {
      // Atualizar
      axios
        .put<RawMaterial>(`${API_URL}/${editId}`, payload)
        .then(() => {
          fetchMaterials();
          setName("");
          setStockQuantity("");
          setEditId(null);
          setError("");
        })
        .catch((err: AxiosError) => {
          console.error(err);
          setError("Failed to update raw material");
        });
    }
  };

  // Editar
  const handleEdit = (material: RawMaterial) => {
    setName(material.name);
    setStockQuantity(material.stockQuantity.toString());
    setEditId(material.id);
    setError("");
  };

  // Deletar
  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this raw material?")) return;
    
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => {
        fetchMaterials();
        setError("");
      })
      .catch((err: AxiosError) => {
        console.error(err);
        setError("Failed to delete raw material");
      });
  };

  return (
    <div className="component-card">
      <h1>Raw Materials</h1>

      {error && <p className="error" data-cy="error-message" style={{ color: 'rgb(255, 0, 0)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} data-cy="raw-material-form">
        <input
          data-cy="raw-material-name-input"
          type="text"
          placeholder="Material Name (ex: Wood)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          data-cy="raw-material-quantity-input"
          type="number"
          placeholder="Stock Quantity (ex: 100)"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          min="1"
          required
        />
        <button type="submit" data-cy="submit-raw-material-btn">{editId === null ? "Add" : "Update"}</button>
        {editId !== null && (
          <button
            type="button"
            data-cy="cancel-btn"
            onClick={() => {
              setEditId(null);
              setName("");
              setStockQuantity("");
              setError("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div 
        className="table-container"
        data-cy="raw-materials-list"
        style={{
          maxHeight: materials.length >= 3 ? '400px' : 'none',
          overflowY: materials.length >= 3 ? 'auto' : 'visible',
          border: materials.length >= 3 ? '1px solid #e1e4f0' : 'none',
          borderRadius: '8px',
          padding: materials.length >= 3 ? '0.5rem' : '0'
        }}
      >
        <ul style={{ 
          margin: 0,
          padding: 0,
          listStyle: 'none'
        }}>
          {materials.length === 0 ? (
            <li data-cy="empty-state" style={{ justifyContent: 'center', color: '#64748b', fontStyle: 'italic' }}>
              No raw materials found. Create one above.
            </li>
          ) : (
            materials.map((m) => (
              <li key={m.id} data-cy="raw-material-row">
                <span>
                  <strong data-cy="raw-material-name" data-testid="raw-material-name">{m.name}</strong> - Quantity: <span data-cy="raw-material-stock" data-testid="raw-material-stock">{m.stockQuantity}</span>
                </span>
                <div className="actions">
                  <button className="edit-btn" data-cy="edit-raw-material-btn" onClick={() => handleEdit(m)}>Edit</button>
                  <button className="delete-btn" data-cy="delete-raw-material-btn" onClick={() => handleDelete(m.id)}>Delete</button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default RawMaterials;