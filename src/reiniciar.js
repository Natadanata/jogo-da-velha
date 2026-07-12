import { useState } from "react";

export function BotaoReiniciar({
  setQuadrados,
  setEstado,
  setStatus,
  setHistorico,
  setVencedores
}) {
  // Estado para controlar o efeito de passar o mouse (hover)
  const [isHovered, setIsHovered] = useState(false);

  /* Reseta todos os estados do jogo para os valores iniciais */
  function reiniciarJogo() {
    setQuadrados(Array(9).fill(null));
    setEstado(0); // Ajustado para 0 para alinhar com o turno numérico do Campo
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
  }

  // Estilos bem ao estilo Pokémon / Moderno
  const estiloBotao = {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: isHovered ? "#d42020" : "#d42020", // Alterna entre o Azul e o Amarelo clássicos de Pokémon
    border: "2px solid #000000",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: isHovered 
      ? "0 4px 8px rgba(0, 0, 0, 0.3)" 
      : "0 2px 4px rgba(0, 0, 0, 0.2)",
    transform: isHovered ? "scale(1.03)" : "scale(1)",
    transition: "all 0.2s ease-in-out",
    outline: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  };

  return (
    <div>
      <button 
        onClick={reiniciarJogo}
        style={estiloBotao}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        ==Reiniciar Batalha==
      </button>
    </div>
  );
}