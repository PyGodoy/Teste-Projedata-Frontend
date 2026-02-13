import Production from "./components/Production";
import ProductRawMaterials from "./components/ProductRawMaterials";
import Products from "./components/Products";
import RawMaterials from "./components/RawMaterials";

function App() {
  return (
    <div className="App">
      <Products />
      <RawMaterials/>
      <ProductRawMaterials/>
      <Production/>
    </div>
  );
}

export default App;
