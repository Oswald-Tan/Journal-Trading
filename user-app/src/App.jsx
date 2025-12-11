import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFoundPage from "./components/404";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Targets from "./pages/Targets";
import ProfileSettings from "./pages/ProfileSettings";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
import UpgradePage from "./components/UpgradePage";
import ForexCalculator from "./pages/ForexCalculator";
import LayoutUser from "./layout/LayoutUser";
import EducationIndex from "./pages/Education/index";
import EducationCategory from "./pages/Education/[category]";
import Gamification from "./pages/Gamification";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<LayoutUser />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/calculator" element={<ForexCalculator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/targets" element={<Targets />} />

            <Route path="/education" element={<EducationIndex />} />
            <Route
              path="/education/:category"
              element={<EducationCategory />}
            />
            <Route path="/gamification" element={<Gamification />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
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
