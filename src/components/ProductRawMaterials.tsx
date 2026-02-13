import { useEffect, useState, type FormEvent,  } from "react";
import axios, { type AxiosResponse, type AxiosError } from "axios";

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
  const [quantityRequired, setQuantityRequired] = useState<number>(0);
  const [editId, setEditId] = useState<number | null>(null);

  const API_URL = "http://localhost:8080/product-materials";

  // Buscar associações
  const fetchAssociations = () => {
    axios
      .get<ProductRawMaterial[]>(API_URL)
      .then((res: AxiosResponse<ProductRawMaterial[]>) => setAssociations(res.data))
      .catch((err: AxiosError) => console.error(err));
  };

  // Buscar produtos e matérias-primas
  const fetchProductsAndMaterials = () => {
    axios
      .get<Product[]>("http://localhost:8080/products")
      .then((res: AxiosResponse<Product[]>) => setProducts(res.data))
      .catch((err: AxiosError) => console.error(err));

    axios
      .get<RawMaterial[]>("http://localhost:8080/raw-materials")
      .then((res: AxiosResponse<RawMaterial[]>) => setRawMaterials(res.data))
      .catch((err: AxiosError) => console.error(err));
  };

  useEffect(() => {
    fetchProductsAndMaterials();
    fetchAssociations();
  }, []);

  // Criar ou atualizar associação
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedProductId === "" || selectedRawMaterialId === "" || quantityRequired <= 0) return;

    const payload = {
      productId: selectedProductId,
      rawMaterialId: selectedRawMaterialId,
      quantityRequired,
    };

    if (editId === null) {
      axios
        .post<ProductRawMaterial>(API_URL, payload)
        .then(() => {
          fetchAssociations();
          resetForm();
        })
        .catch((err: AxiosError) => console.error(err));
    } else {
      axios
        .put<ProductRawMaterial>(`${API_URL}/${editId}`, payload)
        .then(() => {
          fetchAssociations();
          resetForm();
        })
        .catch((err: AxiosError) => console.error(err));
    }
  };

  // Editar associação
  const handleEdit = (assoc: ProductRawMaterial) => {
    setSelectedProductId(assoc.product.id);
    setSelectedRawMaterialId(assoc.rawMaterial.id);
    setQuantityRequired(assoc.quantityRequired);
    setEditId(assoc.id);
  };

  // Deletar associação
  const handleDelete = (id: number) => {
    axios
      .delete(`${API_URL}/${id}`)
      .then(() => fetchAssociations())
      .catch((err: AxiosError) => console.error(err));
  };

  const resetForm = () => {
    setSelectedProductId("");
    setSelectedRawMaterialId("");
    setQuantityRequired(0);
    setEditId(null);
  };

  return (
    <div>
      <h1>Associate Raw Materials to Products</h1>

      <form onSubmit={handleSubmit}>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(Number(e.target.value))}
          required
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
          placeholder="Quantity Required"
          value={quantityRequired}
          onChange={(e) => setQuantityRequired(Number(e.target.value))}
          min={1}
          required
        />

        <button type="submit">{editId === null ? "Add" : "Update"}</button>
        {editId !== null && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <ul>
        {associations.map((a) => (
          <li key={a.id}>
            Product: {a.product.name} - Material: {a.rawMaterial.name} - Quantity: {a.quantityRequired}{" "}
            <button onClick={() => handleEdit(a)}>Edit</button>{" "}
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductRawMaterials;
