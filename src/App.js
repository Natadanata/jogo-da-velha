import { useState } from "react";
import { BotaoReiniciar } from "./Reiniciar";

function Square({ valor, func, vencedor }) {
  return (
    <button
      className={`square ${vencedor ? "winner" : ""}`}
      onClick={func}
    >
      {valor}
    </button>
  );
}

export default function Campo() {
  const [quadrados, setQuadrados] = useState(Array(9).fill(null));
  const [estado, setEstado] = useState(false);
  const [status, setStatus] = useState(null);

  const [placarX, setPlacarX] = useState(0);
  const [placarO, setPlacarO] = useState(0);
  const [empates, setEmpates] = useState(0);

  const [historico, setHistorico] = useState([]);
  const [vencedores, setVencedores] = useState([]);

  const [contraMaquina, setContraMaquina] = useState(false);

  function calcularVencedor(tabuleiro) {
    const linhas = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < linhas.length; i++) {
      const [a, b, c] = linhas[i];

      if (
        tabuleiro[a] &&
        tabuleiro[a] === tabuleiro[b] &&
        tabuleiro[a] === tabuleiro[c]
      ) {
        return {
          vencedor: tabuleiro[a],
          linha: linhas[i]
        };
      }
    }

    if (tabuleiro.every(casa => casa !== null)) {
      return { vencedor: "empate", linha: [] };
    }

    return null;
  }

  function finalizarJogo(resultado) {
    if (resultado.vencedor === "X") {
      setStatus("Jogador X venceu!");
      setPlacarX(v => v + 1);
      setVencedores(resultado.linha);
    } else if (resultado.vencedor === "O") {
      setStatus("Jogador O venceu!");
      setPlacarO(v => v + 1);
      setVencedores(resultado.linha);
    } else {
      setStatus("Empate!");
      setEmpates(v => v + 1);
    }
  }

  function jogadaMaquina(tabuleiroAtual) {
    let livres = [];

    for (let i = 0; i < 9; i++) {
      if (tabuleiroAtual[i] === null) {
        livres.push(i);
      }
    }

    if (livres.length === 0) return;

    const posicao =
      livres[Math.floor(Math.random() * livres.length)];

    const novo = [...tabuleiroAtual];
    novo[posicao] = "O";

    setQuadrados(novo);

    setHistorico(h => [
      ...h,
      `Jogada ${h.length + 1}: O na posição ${posicao}`
    ]);

    const resultado = calcularVencedor(novo);

    if (resultado) {
      finalizarJogo(resultado);
    } else {
      setEstado(false);
    }
  }

  function handleClick(i) {
    if (status) return;

    const novo = [...quadrados];

    if (novo[i] !== null) return;

    const jogador = estado ? "O" : "X";

    novo[i] = jogador;

    setQuadrados(novo);

    setHistorico(h => [
      ...h,
      `Jogada ${h.length + 1}: ${jogador} na posição ${i}`
    ]);

    const resultado = calcularVencedor(novo);

    if (resultado) {
      finalizarJogo(resultado);
      return;
    }

    setEstado(!estado);

    if (contraMaquina && jogador === "X") {
      setTimeout(() => {
        jogadaMaquina(novo);
      }, 500);
    }
  }

  function desfazerJogada() {
    if (historico.length === 0 || status) return;

    const novoHistorico = [...historico];
    novoHistorico.pop();

    const novoTabuleiro = [...quadrados];

    for (let i = 8; i >= 0; i--) {
      if (novoTabuleiro[i] !== null) {
        novoTabuleiro[i] = null;
        break;
      }
    }

    setHistorico(novoHistorico);
    setQuadrados(novoTabuleiro);
    setEstado(!estado);
  }

  const jogadorAtual = estado ? "O" : "X";

  return (
    <>
      <h2>Vez do jogador: {jogadorAtual}</h2>

      <h3>Modo: {contraMaquina ? "Jogador vs Máquina" : "Jogador vs Jogador"}</h3>

      <button onClick={() => setContraMaquina(!contraMaquina)}>
        Trocar Modo
      </button>

      <h3>Placar</h3>
      <p>X: {placarX}</p>
      <p>O: {placarO}</p>
      <p>Empates: {empates}</p>

      <div className="board-row">
        <Square valor={quadrados[0]} vencedor={vencedores.includes(0)} func={() => handleClick(0)} />
        <Square valor={quadrados[1]} vencedor={vencedores.includes(1)} func={() => handleClick(1)} />
        <Square valor={quadrados[2]} vencedor={vencedores.includes(2)} func={() => handleClick(2)} />
      </div>

      <div className="board-row">
        <Square valor={quadrados[3]} vencedor={vencedores.includes(3)} func={() => handleClick(3)} />
        <Square valor={quadrados[4]} vencedor={vencedores.includes(4)} func={() => handleClick(4)} />
        <Square valor={quadrados[5]} vencedor={vencedores.includes(5)} func={() => handleClick(5)} />
      </div>

      <div className="board-row">
        <Square valor={quadrados[6]} vencedor={vencedores.includes(6)} func={() => handleClick(6)} />
        <Square valor={quadrados[7]} vencedor={vencedores.includes(7)} func={() => handleClick(7)} />
        <Square valor={quadrados[8]} vencedor={vencedores.includes(8)} func={() => handleClick(8)} />
      </div>

      <h1>{status}</h1>

      <BotaoReiniciar
        setQuadrados={setQuadrados}
        setEstado={setEstado}
        setStatus={setStatus}
        setHistorico={setHistorico}
        setVencedores={setVencedores}
      />

      <button onClick={desfazerJogada}>
        Desfazer Jogada
      </button>

      <h3>Histórico</h3>

      <ul>
        {historico.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </>
  );
    }
