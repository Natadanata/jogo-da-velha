import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./app";

/* Cria a raiz do React apontando para o elemento HTML 'root' e renderiza o componente principal <App /> dentro do StrictMode para validações em desenvolvimento */
const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);