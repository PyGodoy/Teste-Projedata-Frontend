import { useEffect, useState, type FormEvent,  } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

interface RawMaterial {
  id: number;
  name: string;
  stockQuantity: number;
}

function RawMaterials() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [name, setName] = useState("");
  const [stockQuantity, setStockQuantity] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);

  const API_URL = "http://localhost:8080/raw-materials";

  // Listar matérias-primas
  const fetchMaterials = () => {
    axios
      .get<RawMaterial[]>(API_URL)
      .then((res: AxiosResponse<RawMaterial[]>) => setMaterials(res.data))
      .catch((err: AxiosError) => console.error(err));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Criar ou atualizar
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const payload = { name, stockQuantity };

    if (editId === null) {
      // Criar
      axios
        .post<RawMaterial>(API_URL, payload)
        .then(() => {
          fetchMaterials();
          setName("");
          setStockQuantity(0);
        })
        .catch((err: AxiosError) => console.error(err));
    } else {
      // Atualizar
      axios
        .put<RawMaterial>(`${API_URL}/${editId}`, payload)
        .then(() => {
          fetchMaterials();
          setName("");
          setStockQuantity(0);
          setEditId(null);
        })
        .catch((err: AxiosError) => console.error(err));
    }
  };

  // Editar
  const handleEdit = (material: RawMaterial) => {
    setName(material.name);
    setStockQuantity(material.stockQuantity);
    setEditId(material.id);
  };

  // Deletar
  const handleDelete = (id: number) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => fetchMaterials())
      .catch((err: AxiosError) => console.error(err));
  };

  return (
    <div>
      <h1>Raw Materials</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Stock Quantity"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(Number(e.target.value))}
          required
        />
        <button type="submit">{editId === null ? "Add" : "Update"}</button>
        {editId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setName("");
              setStockQuantity(0);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <ul>
        {materials.map((m) => (
          <li key={m.id}>
            {m.name} - Quantity: {m.stockQuantity}{" "}
            <button onClick={() => handleEdit(m)}>Edit</button>{" "}
            <button onClick={() => handleDelete(m.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RawMaterials;
