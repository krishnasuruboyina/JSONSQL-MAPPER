import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Path1 from "./components/Path1";
import Path2 from "./components/Path2";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/path1" element={<Path1 />} />
        <Route path="/path2" element={<Path2 />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;