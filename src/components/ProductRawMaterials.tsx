import { useEffect, useState, type FormEvent } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  id: number;
  name: string;
  price: number;
}

interface RawMaterial {
  id: number;
  name: string;
  stockQuantity: number;
}

interface ProductRawMaterial {
  id: number;
  product: Product;
  rawMaterial: RawMaterial;
  quantityRequired: number;
}

function ProductRawMaterials() {
  const [associations, setAssociations] = useState<ProductRawMaterial[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<number | "">("");
  const [quantityRequired, setQuantityRequired] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Buscar associações
  const fetchAssociations = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res: AxiosResponse<ProductRawMaterial[]> = await axios.get(`${API_URL}/product-materials`);
      setAssociations(res.data);
    } catch (err: AxiosError | any) {
      setError("Failed to fetch associations");
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  // Buscar produtos
  const fetchProducts = async () => {
    try {
      const res: AxiosResponse<Product[]> = await axios.get(`${API_URL}/products`);
      setProducts(res.data);
    } catch (err: AxiosError | any) {
      console.error(err);
    }
  };

  // Buscar matérias-primas
  const fetchRawMaterials = async () => {
    try {
      const res: AxiosResponse<RawMaterial[]> = await axios.get(`${API_URL}/raw-materials`);
      setRawMaterials(res.data);
    } catch (err: AxiosError | any) {
      console.error(err);
    }
  };

  // Buscar todos os dados
  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      await Promise.all([
        fetchAssociations(),
        fetchProducts(),
        fetchRawMaterials()
      ]);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Criar ou atualizar associação
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (selectedProductId === "" || selectedRawMaterialId === "" || !quantityRequired) {
      setError("Please fill all fields correctly");
      return;
    }

    const quantity = parseInt(quantityRequired);
    
    if (isNaN(quantity) || quantity <= 0) {
      setError("Quantity must be a positive number");
      return;
    }

    const payload = {
      productId: selectedProductId,
      rawMaterialId: selectedRawMaterialId,
      quantityRequired: quantity,
    };

    setLoading(true);
    setError("");

    try {
      if (editId === null) {
        await axios.post<ProductRawMaterial>(`${API_URL}/product-materials`, payload);
      } else {
        await axios.put<ProductRawMaterial>(`${API_URL}/product-materials/${editId}`, payload);
      }
      await fetchAssociations();
      resetForm();
    } catch (err: AxiosError | any) {
      setError(`Failed to ${editId === null ? 'create' : 'update'} association`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Editar associação
  const handleEdit = (assoc: ProductRawMaterial) => {
    setSelectedProductId(assoc.product.id);
    setSelectedRawMaterialId(assoc.rawMaterial.id);
    setQuantityRequired(assoc.quantityRequired.toString());
    setEditId(assoc.id);
    setError("");
  };

  // Deletar associação
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this association?")) return;
    
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${API_URL}/product-materials/${id}`);
      await fetchAssociations();
    } catch (err: AxiosError | any) {
      setError("Failed to delete association");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedRawMaterialId("");
    setQuantityRequired("");
    setEditId(null);
    setError("");
  };

  // Refresh completo
  const handleRefresh = () => {
    fetchAllData();
  };

  return (
    <div className="component-card">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Associate Raw Materials to Products</h1>
        <button 
          type="button" 
          onClick={handleRefresh}
          disabled={refreshing || loading}
          data-cy="refresh-btn"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && <p className="error" data-cy="error-message" style={{ color: 'rgb(255, 0, 0)' }}>{error}</p>}

      <form onSubmit={handleSubmit} data-cy="association-form">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
          required
          disabled={loading}
          data-cy="product-select"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (${p.price})
            </option>
          ))}
        </select>

        <select
          value={selectedRawMaterialId}
          onChange={(e) => setSelectedRawMaterialId(Number(e.target.value))}
          required
          disabled={loading}
          data-cy="raw-material-select"
        >
          <option value="">Select Raw Material</option>
          {rawMaterials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} - Stock: {m.stockQuantity}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity Required (ex: 5)"
          value={quantityRequired}
          onChange={(e) => setQuantityRequired(e.target.value)}
          min={1}
          required
          disabled={loading}
          data-cy="quantity-input"
        />

        <button type="submit" disabled={loading} data-cy="submit-association-btn">
          {editId === null ? 'Add' : 'Update'}
        </button>
        
        {editId !== null && (
          <button type="button" onClick={resetForm} disabled={loading} data-cy="cancel-btn">
            Cancel
          </button>
        )}
      </form>

      {loading && !refreshing && <p data-cy="loading">Loading...</p>}

      <div 
        className="table-container"
        data-cy="associations-list-container"
        style={{
          maxHeight: associations.length >= 3 ? '400px' : 'none',
          overflowY: associations.length >= 3 ? 'auto' : 'visible',
          border: associations.length >= 3 ? '1px solid #e1e4f0' : 'none',
          borderRadius: '8px',
          padding: associations.length >= 3 ? '0.5rem' : '0',
          marginTop: '1rem'
        }}
      >
        <ul style={{ 
          margin: 0,
          padding: 0,
          listStyle: 'none'
        }}
        data-cy="associations-list"
        >
          {associations.length === 0 && !loading && !refreshing ? (
            <li style={{ justifyContent: 'center' }} data-cy="empty-state">No associations found. Create one above.</li>
          ) : (
            associations.map((a) => (
              <li key={a.id} data-cy="association-row">
                <span data-cy="association-details">
                  <strong>Product:</strong> <span data-cy="association-product-name">{a.product.name}</span> |{' '}
                  <strong>Material:</strong> <span data-cy="association-material-name">{a.rawMaterial.name}</span> |{' '}
                  <strong>Quantity:</strong> <span data-cy="association-quantity">{a.quantityRequired}</span>
                </span>
                <div className="actions">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEdit(a)}
                    disabled={loading}
                    data-cy="edit-association-btn"
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(a.id)}
                    disabled={loading}
                    data-cy="delete-association-btn"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default ProductRawMaterials;