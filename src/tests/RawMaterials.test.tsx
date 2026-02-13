// RawMaterials.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import RawMaterials from "../components/RawMaterials";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("RawMaterials Component", () => {
  it("renders raw materials list from API", async () => {
    const materials = [
      { id: 1, name: "CPU", quantity: 10 },
      { id: 2, name: "RAM", quantity: 20 },
    ];

    mockedAxios.get.mockResolvedValue({ data: materials });

    render(<RawMaterials />);

    await waitFor(() => {
      expect(screen.getByText(/CPU/i)).toBeInTheDocument();
      expect(screen.getByText(/RAM/i)).toBeInTheDocument();
    });
  });
});
