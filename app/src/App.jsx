import { HashRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing";
import NotFoundPage from "./components/404";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
