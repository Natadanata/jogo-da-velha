export function BotaoReiniciar({
  setQuadrados,
  setEstado,
  setStatus,
  setHistorico,
  setVencedores
}) {
  function reiniciarJogo() {
    setQuadrados(Array(9).fill(null));
    setEstado(false);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
  }

  return (
    <div>
      <button onClick={reiniciarJogo}>
        Reiniciar
      </button>
    </div>
  );
}
