import { render, screen, waitFor } from "@testing-library/react";
import Products from "../components/Products"
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Products Component", () => {
  it("renders product list from API", async () => {
    const products = [
      { id: 1, name: "PC Gamer", price: 100, quantity: 2 },
      { id: 2, name: "Notebook", price: 200, quantity: 5 },
    ];

    mockedAxios.get.mockResolvedValue({ data: products });

    render(<Products />);

    await waitFor(() => {
      expect(screen.getByText(/PC Gamer/i)).toBeInTheDocument();
      expect(screen.getByText(/Notebook/i)).toBeInTheDocument();
    });
  });
});
