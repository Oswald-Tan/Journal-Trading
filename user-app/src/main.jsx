import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./app/store.js";
import { SidebarProvider } from "./context/SidebarProvider.jsx";
import { Provider } from "react-redux";
import axios from "axios";
import { LanguageProvider } from "./context/LanguageContext.jsx";

axios.defaults.withCredentials = true;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SidebarProvider>
      <Provider store={store}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Provider>
    </SidebarProvider>
  </StrictMode>
);
