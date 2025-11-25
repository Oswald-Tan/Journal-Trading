import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/404";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import TradingJournal from "./pages";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Targets from "./pages/Targets";
import ProfileSettings from "./pages/ProfileSettings";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import UpgradePage from "./components/UpgradePage";
import ForexCalculator from "./components/ForexCalculator";
import Education from "./pages/Education";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<TradingJournal />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/calculator" element={<ForexCalculator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/education" element={<Education />} />
          </Route>

          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/resend-verification" element={<VerifyEmailPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
