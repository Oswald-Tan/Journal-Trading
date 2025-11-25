import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/404";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AuroraLanding from "./layout/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuroraLanding />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
