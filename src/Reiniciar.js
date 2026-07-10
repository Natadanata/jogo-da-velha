export function BotaoReiniciar({
  setQuadrados,
  setEstado,
  setStatus,
  setHistorico,
  setVencedores
}) {
  /* Reseta todos os estados do jogo para os valores iniciais, limpando o tabuleiro, histórico, status e vencedores */
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