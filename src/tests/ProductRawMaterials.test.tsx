// ProductRawMaterials.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import ProductRawMaterials from "../components/ProductRawMaterials";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ProductRawMaterials Component", () => {
  it("renders product-raw-material associations", async () => {
    const associations = [
      {
        id: 1,
        product: { id: 1, name: "PC Gamer", price: 100, quantity: 2 },
        rawMaterial: { id: 1, name: "CPU", quantity: 10 },
        quantityRequired: 2,  // ← CORRIGIDO: era "requiredQuantity", agora é "quantityRequired"
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: associations });

    render(<ProductRawMaterials />);

    await waitFor(() => {
        // Busca pelo li que contém "Product:" seguido de "PC Gamer"
        const listItems = screen.getAllByRole('listitem');
        const item = listItems.find(li => 
          li.textContent?.includes("PC Gamer") && li.textContent?.includes("Product:")
        );
        
        expect(item).toBeDefined();
        expect(item).toHaveTextContent("CPU");
        expect(item).toHaveTextContent("2");
    });
  });
});