import { useState } from "react";
import { BotaoReiniciar } from "./reiniciar";

const SIMBOLOS = ["X", "O", "Δ", "◻"];

function Square({ valor, func, vencedor, tamanhoGrid }) {
  let colorClass = "";
  if (valor === "X") colorClass = "text-x";
  else if (valor === "O") colorClass = "text-o";
  else if (valor === "Δ") colorClass = "text-delta";
  else if (valor === "◻") colorClass = "text-square";

  let sizeClass = "square";
  if (tamanhoGrid === 7) sizeClass = "square-small";
  if (tamanhoGrid === 9) sizeClass = "square-small square-extra-small";

  return (
    <button
      className={`${sizeClass} ${vencedor ? "winner" : ""} ${colorClass}`}
      onClick={func}
    >
      {valor}
    </button>
  );
}

export default function Campo() {
  const [tamanhoGrid, setTamanhoGrid] = useState(3);
  const [numJogadores, setNumJogadores] = useState(2);
  const [quadrados, setQuadrados] = useState(Array(9).fill(null));
  
  const [turno, setTurno] = useState(0); // 0 = X, 1 = O, 2 = Δ, 3 = ◻
  const [status, setStatus] = useState(null);

  // Placar adaptado para suportar qualquer jogador + empates
  const [placar, setPlacar] = useState({ "X": 0, "O": 0, "Δ": 0, "◻": 0, "Empates": 0 });

  const [historico, setHistorico] = useState([]);
  const [vencedores, setVencedores] = useState([]);

  const [contraMaquina, setContraMaquina] = useState(false);
  const [dificuldade, setDificuldade] = useState("facil");

  const sequenciaVitoria = tamanhoGrid === 3 ? 3 : (tamanhoGrid === 9 ? 5 : 4);
  const jogadorAtual = SIMBOLOS[turno];

  function mudarTamanhoJogo(novoTamanho) {
    setTamanhoGrid(novoTamanho);
    setQuadrados(Array(novoTamanho * novoTamanho).fill(null));
    setTurno(0);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
    if (novoTamanho !== 9) setNumJogadores(2); // Retorna a 2 jogadores se sair do 9x9
  }

  function mudarNumJogadores(num) {
    setNumJogadores(num);
    if (num > 2) setContraMaquina(false); // Desativa máquina se tiver 4 jogadores
    setQuadrados(Array(tamanhoGrid * tamanhoGrid).fill(null));
    setTurno(0);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
  }

  function calcularVencedor(tabuleiro, tamanho, seq) {
    for (let r = 0; r < tamanho; r++) {
      for (let c = 0; c < tamanho; c++) {
        let pos = r * tamanho + c;
        let jogador = tabuleiro[pos];
        if (!jogador) continue;

        if (c <= tamanho - seq) {
          let venceu = true, linha = [];
          for (let i = 0; i < seq; i++) {
            if (tabuleiro[r * tamanho + c + i] !== jogador) venceu = false;
            linha.push(r * tamanho + c + i);
          }
          if (venceu) return { vencedor: jogador, linha };
        }
        if (r <= tamanho - seq) {
          let venceu = true, linha = [];
          for (let i = 0; i < seq; i++) {
            if (tabuleiro[(r + i) * tamanho + c] !== jogador) venceu = false;
            linha.push((r + i) * tamanho + c);
          }
          if (venceu) return { vencedor: jogador, linha };
        }
        if (r <= tamanho - seq && c <= tamanho - seq) {
          let venceu = true, linha = [];
          for (let i = 0; i < seq; i++) {
            if (tabuleiro[(r + i) * tamanho + c + i] !== jogador) venceu = false;
            linha.push((r + i) * tamanho + c + i);
          }
          if (venceu) return { vencedor: jogador, linha };
        }
        if (r <= tamanho - seq && c >= seq - 1) {
          let venceu = true, linha = [];
          for (let i = 0; i < seq; i++) {
            if (tabuleiro[(r + i) * tamanho + c - i] !== jogador) venceu = false;
            linha.push((r + i) * tamanho + c - i);
          }
          if (venceu) return { vencedor: jogador, linha };
        }
      }
    }
    if (tabuleiro.every(casa => casa !== null)) {
      return { vencedor: "empate", linha: [] };
    }
    return null;
  }

  function finalizarJogo(resultado) {
    if (resultado.vencedor === "empate") {
      setStatus("Deu Velha! (Empate) 🤝");
      setPlacar(p => ({ ...p, Empates: p.Empates + 1 }));
    } else {
      setStatus(`Jogador ${resultado.vencedor} venceu! 🎉`);
      setPlacar(p => ({ ...p, [resultado.vencedor]: p[resultado.vencedor] + 1 }));
      setVencedores(resultado.linha);
    }
  }

  function procurarJogadaCritica(tabuleiroAtual, jogador) {
    for (let i = 0; i < tamanhoGrid * tamanhoGrid; i++) {
      if (tabuleiroAtual[i] === null) {
        const temp = [...tabuleiroAtual];
        temp[i] = jogador;
        if (calcularVencedor(temp, tamanhoGrid, sequenciaVitoria)) return i;
      }
    }
    return -1;
  }

  function jogadaMaquina(tabuleiroAtual) {
    if (status) return;
    let livres = [];
    for (let i = 0; i < tamanhoGrid * tamanhoGrid; i++) {
      if (tabuleiroAtual[i] === null) livres.push(i);
    }
    if (livres.length === 0) return;

    let posicao = -1;

    if (dificuldade === "facil") {
      posicao = livres[Math.floor(Math.random() * livres.length)];
    } else {
      posicao = procurarJogadaCritica(tabuleiroAtual, "O"); // Tenta ganhar
      if (posicao === -1) {
        posicao = procurarJogadaCritica(tabuleiroAtual, "X"); // Tenta bloquear
      }
      if (posicao === -1) {
        const centro = Math.floor((tamanhoGrid * tamanhoGrid) / 2);
        if (tabuleiroAtual[centro] === null && dificuldade === "dificil") {
          posicao = centro;
        } else {
          posicao = livres[Math.floor(Math.random() * livres.length)];
        }
      }
    }

    const novo = [...tabuleiroAtual];
    novo[posicao] = "O";
    setQuadrados(novo);
    setHistorico(h => [...h, { posicao, msg: `Jogada ${h.length + 1}: O na posição ${posicao}` }]);

    const resultado = calcularVencedor(novo, tamanhoGrid, sequenciaVitoria);
    if (resultado) {
      finalizarJogo(resultado);
    } else {
      setTurno(0); // Volta para o X
    }
  }

  function handleClick(i) {
    if (status || quadrados[i] !== null) return;

    const novo = [...quadrados];
    novo[i] = jogadorAtual;
    setQuadrados(novo);
    setHistorico(h => [...h, { posicao: i, msg: `Jogada ${h.length + 1}: ${jogadorAtual} na posição ${i}` }]);

    const resultado = calcularVencedor(novo, tamanhoGrid, sequenciaVitoria);
    if (resultado) {
      finalizarJogo(resultado);
      return;
    }
    
    const proximoTurno = (turno + 1) % numJogadores;
    setTurno(proximoTurno);

    if (contraMaquina && numJogadores === 2 && proximoTurno === 1) {
      setTimeout(() => { jogadaMaquina(novo); }, 500);
    }
  }

  function desfazerJogada() {
    if (historico.length === 0 || status) return;
    const novoHistorico = [...historico];
    const novoTabuleiro = [...quadrados];

    // Se estiver a jogar contra a máquina, retrocede duas jogadas (a da máquina e a sua)
    if (contraMaquina && numJogadores === 2 && historico.length >= 2) {
      const last1 = novoHistorico.pop();
      const last2 = novoHistorico.pop();
      novoTabuleiro[last1.posicao] = null;
      novoTabuleiro[last2.posicao] = null;
    } else {
      const last = novoHistorico.pop();
      novoTabuleiro[last.posicao] = null;
      setTurno((turno - 1 + numJogadores) % numJogadores);
    }

    setHistorico(novoHistorico);
    setQuadrados(novoTabuleiro);
  }

  // Gera a malha visual
  const boardRows = [];
  for (let r = 0; r < tamanhoGrid; r++) {
    const rowSquares = [];
    for (let c = 0; c < tamanhoGrid; c++) {
      const i = r * tamanhoGrid + c;
      rowSquares.push(
        <Square 
          key={i} 
          valor={quadrados[i]} 
          vencedor={vencedores.includes(i)} 
          func={() => handleClick(i)} 
          tamanhoGrid={tamanhoGrid}
        />
      );
    }
    boardRows.push(<div key={r} className="board-row">{rowSquares}</div>);
  }

  if (tela === "config") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          alignItems: "center",
          marginTop: 40
        }}
      >
        <h2>Configurações</h2>

        <button onClick={() => setMusica("/musicas/musica1.mp3")}>
          Música 1
        </button>

        <button onClick={() => setMusica("/musicas/musica2.mp3")}>
          Música 2
        </button>

        <button onClick={() => setMusica("")}>
          Parar Música
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={escolherImagem}
        />

        <button onClick={() => setTela("menu")}>
          ⬅ Voltar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundImage: fundo ? `url(${fundo})` : "",
        backgroundSize: "cover"
      }}
    >
      <h1>🎲 Aqui fica o seu jogo</h1>

      <button onClick={() => setTela("menu")}>
        🏠 Menu
      </button>
    </div>
  );

  // Helper local para as cores do título
  function colorClass(simbolo) {
    if (simbolo === "X") return "text-x";
    if (simbolo === "O") return "text-o";
    if (simbolo === "Δ") return "text-delta";
    return "text-square";
  }
}