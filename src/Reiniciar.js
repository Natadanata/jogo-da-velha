export function BotaoReiniciar({setQuadrados, setEstado, setStatus}) {
 
 function reiniciarJogo() {
    setQuadrados(Array(9).fill(null));
    setEstado(false);
    setStatus(null);
  }

  return <><div><button onClick={reiniciarJogo}>Reiniciar</button></div></>
}
