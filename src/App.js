import { useState } from "react";
import { BotaoReiniciar } from "./reiniciar";

const SIMBOLOS = ["X", "O", "Δ", "◻"];

/* Componente que renderiza cada quadrado individual do tabuleiro, definindo suas cores e tamanhos táteis */
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

/* Componente principal que gerencia os estados do jogo, placar, histórico, IA e renderiza a tela */
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

  /* Altera as dimensões da malha do jogo e reinicia o tabuleiro e estados da rodada */
  function mudarTamanhoJogo(novoTamanho) {
    setTamanhoGrid(novoTamanho);
    setQuadrados(Array(novoTamanho * novoTamanho).fill(null));
    setTurno(0);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
    if (novoTamanho !== 9) setNumJogadores(2); // Retorna a 2 jogadores se sair do 9x9
  }

  /* Modifica a quantidade de jogadores na partida e reseta as configurações do tabuleiro */
  function mudarNumJogadores(num) {
    setNumJogadores(num);
    if (num > 2) setContraMaquina(false); // Desativa máquina se tiver 4 jogadores
    setQuadrados(Array(tamanhoGrid * tamanhoGrid).fill(null));
    setTurno(0);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
  }

  /* Analisa o tabuleiro para verificar se há linhas, colunas ou diagonais vitoriosas ou empate */
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

  /* Mostra a mensagem final do jogo na tela e atualiza a pontuação do placar geral */
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

  /* Analisa se o jogador informado está prestes a ganhar para que a IA possa vencer ou bloquear */
  function procurarJogadaCritica(tabuleiroAtual, jogador) {
    for (let i = 0; i < tamanhoGrid * tamanhoGrid; i++) {
      if (tabuleiroAtual[i] === null) {
        const temp = [...tabuleiroAtual];
        temp[i] = actor;
        temp[i] = jogador;
        if (calcularVencedor(temp, tamanhoGrid, sequenciaVitoria)) return i;
      }
    }
    return -1;
  }

  /* Controla a IA calculando a melhor jogada ou jogando aleatório baseado na dificuldade */
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

  /* Gerencia o clique do jogador humano, valida a jogada e aciona a IA se necessário */
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

  /* Remove o último movimento feito, adaptando para remover dois se for contra a máquina */
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

  // Define uma classe CSS dinâmica baseada no tamanho da grelha
  const containerClass = `game-container container-${tamanhoGrid}x${tamanhoGrid}`;

  return (
    <div className={containerClass}>
      <div className="header">
        <h2>Vez do jogador: <span className={colorClass(jogadorAtual)}>{jogadorAtual}</span></h2>
        
        <div className="controls-header" style={{flexWrap: "wrap", marginBottom: "15px", justifyContent: "center"}}>
          <select 
            className="select-dificuldade" 
            value={tamanhoGrid} 
            onChange={(e) => mudarTamanhoJogo(Number(e.target.value))}
          >
            <option value={3}>Malha: 3x3</option>
            <option value={5}>Malha: 5x5 (4 em linha)</option>
            <option value={7}>Malha: 7x7 (4 em linha)</option>
            <option value={9}>Malha: 9x9 (5 em linha)</option>
          </select>

          {tamanhoGrid === 9 && (
            <select 
              className="select-dificuldade" 
              value={numJogadores} 
              onChange={(e) => mudarNumJogadores(Number(e.target.value))}
            >
              <option value={2}>2 Jogadores</option>
              <option value={4}>4 Jogadores</option>
            </select>
          )}

          <button 
            className="btn-secondary select-dificuldade" 
            onClick={() => {
              setContraMaquina(!contraMaquina);
              mudarTamanhoJogo(tamanhoGrid); // Reseta ao trocar
            }}
            disabled={numJogadores === 4}
            style={{padding: "8px 12px", border: "1px solid #ccc", background: contraMaquina ? "#007bff" : "#e4e6eb", color: contraMaquina ? "white" : "inherit"}}
          >
            {contraMaquina ? "🤖 VS Máquina (ON)" : "🧑‍🤝‍🧑 VS Máquina (OFF)"}
          </button>

          {contraMaquina && numJogadores === 2 && (
            <select 
              className="select-dificuldade" 
              value={dificuldade} 
              onChange={(e) => setDificuldade(e.target.value)}
            >
              <option value="facil">Dif: Fácil</option>
              <option value="medio">Dif: Médio</option>
              <option value="dificil">Dif: Difícil</option>
            </select>
          )}
        </div>
      </div>

      <div className="scoreboard" style={{flexWrap: "wrap"}}>
        {SIMBOLOS.slice(0, numJogadores).map(simbolo => (
          <div className="score-box" key={simbolo} style={{minWidth: "60px"}}>
            <span>{simbolo}</span>
            <strong>{placar[simbolo]}</strong>
          </div>
        ))}
        <div className="score-box" style={{minWidth: "70px"}}>
          <span>Empates</span>
          <strong>{placar["Empates"]}</strong>
        </div>
      </div>

      <div className="board">
        {boardRows}
      </div>

      <div className="status-message">
        {status ? <h1>{status}</h1> : <h1 style={{visibility: "hidden"}}>_</h1>}
      </div>

      <div className="controls">
        <BotaoReiniciar
          setQuadrados={() => setQuadrados(Array(tamanhoGrid * tamanhoGrid).fill(null))}
          setEstado={() => setTurno(0)}
          setStatus={setStatus}
          setHistorico={setHistorico}
          setVencedores={setVencedores}
        />
        <button className="btn-secondary" onClick={desfazerJogada} disabled={historico.length === 0 || status}>
          Desfazer
        </button>
      </div>

      {historico.length > 0 && (
        <div className="history">
          <h3>Histórico ({historico.length} jogadas)</h3>
          <ul>
            {historico.map((item, index) => (
              <li key={index}>{item.msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  /* Helper local para definir a classe de cor correta da string do jogador atual */
  function colorClass(simbolo) {
    if (simbolo === "X") return "text-x";
    if (simbolo === "O") return "text-o";
    if (simbolo === "Δ") return "text-delta";
    return "text-square";
  }
}