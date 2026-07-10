import { useState, useEffect } from "react";
import { BotaoReiniciar } from "./reiniciar";

/* Componente que renderiza cada quadrado individual do tabuleiro */
function Square({ valor, func, vencedor, tamanhoGrid, jogadores }) {
  let sizeClass = "square";
  if (tamanhoGrid === 7) sizeClass = "square-small";
  if (tamanhoGrid === 9) sizeClass = "square-small square-extra-small";

  // Define o conteúdo da casa (Imagem do Pokémon correspondente ao jogador)
  let conteudo = null;
  if (valor !== null && jogadores[valor]) {
    if (jogadores[valor].imagem) {
      conteudo = (
        <img 
          src={jogadores[valor].imagem} 
          alt={jogadores[valor].nome} 
          style={{ width: "80%", height: "80%", objectFit: "contain" }} 
        />
      );
    } else {
      conteudo = jogadores[valor].nome;
    }
  }

  return (
    <button
      className={`${sizeClass} ${vencedor ? "winner" : ""}`}
      onClick={func}
    >
      {conteudo}
    </button>
  );
}

/* Componente principal que gerencia o jogo */
export default function Campo() {
  const [tamanhoGrid, setTamanhoGrid] = useState(3);
  const [numJogadores, setNumJogadores] = useState(2);
  const [quadrados, setQuadrados] = useState(Array(9).fill(null));
  
  const [turno, setTurno] = useState(0); // 0 = P1, 1 = P2, 2 = P3, 3 = P4
  const [status, setStatus] = useState(null);

  // Placar utilizando o índice de cada um dos 4 jogadores e Empates
  const [placar, setPlacar] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, "Empates": 0 });
  const [historico, setHistorico] = useState([]);
  const [vencedores, setVencedores] = useState([]);

  const [contraMaquina, setContraMaquina] = useState(false);
  const [dificuldade, setDificuldade] = useState("facil");

  // Estados da PokéAPI expandidos para 4 jogadores
  const [pokemonJogadores, setPokemonJogadores] = useState([null, null, null, null]);
  const [buscaP1, setBuscaP1] = useState("pikachu");
  const [buscaP2, setBuscaP2] = useState("bulbasaur");
  const [buscaP3, setBuscaP3] = useState("charmander");
  const [buscaP4, setBuscaP4] = useState("squirtle");
  const [erroApi, setErroApi] = useState("");

  const sequenciaVitoria = tamanhoGrid === 3 ? 3 : (tamanhoGrid === 9 ? 5 : 4);

  // 1. POKÉMONS INICIAIS: Carrega os 4 Pokémon automáticos na montagem do componente
  useEffect(() => {
    carregarPokemons("pikachu", "bulbasaur", "charmander", "squirtle");
  }, []);

  // 4. CONSUMO DA API: Função assíncrona para buscar um Pokémon individual
  async function fetchPokemon(nomePokemon) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon.toLowerCase().trim()}`);
      if (!response.ok) {
        throw new Error(`Pokémon "${nomePokemon}" não encontrado.`);
      }
      const data = await response.json();
      return {
        nome: data.name.toUpperCase(),
        imagem: data.sprites.other["official-artwork"].front_default || data.sprites.front_default
      };
    } catch (error) {
      throw error;
    }
  }

  // 3 e 5. ESCOLHA DOS POKÉMONS E TRATAMENTO DE ERRO PARA OS 4 JOGADORES
  async function carregarPokemons(nomeP1, nomeP2, nomeP3, nomeP4) {
    setErroApi("");
    try {
      const p1Data = await fetchPokemon(nomeP1);
      const p2Data = await fetchPokemon(nomeP2);
      const p3Data = await fetchPokemon(nomeP3);
      const p4Data = await fetchPokemon(nomeP4);
      
      setPokemonJogadores([p1Data, p2Data, p3Data, p4Data]);
    } catch (err) {
      setErroApi(err.message);
    }
  }

  function mudarTamanhoJogo(novoTamanho) {
    setTamanhoGrid(novoTamanho);
    setQuadrados(Array(novoTamanho * novoTamanho).fill(null));
    setTurno(0);
    setStatus(null);
    setHistorico([]);
    setVencedores([]);
    if (novoTamanho !== 9) setNumJogadores(2);
  }

  function mudarNumJogadores(num) {
    setNumJogadores(num);
    if (num > 2) setContraMaquina(false);
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
        if (jogador === null) continue;

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
          if (venceu) return { vencedor: opponent => opponent, linha }; // correção implícita
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
      // 2. RENDERIZAÇÃO CONDICIONAL (?.) para obter o nome do Pokémon vencedor
      const nomeVencedor = pokemonJogadores[resultado.vencedor]?.nome || `Jogador ${resultado.vencedor + 1}`;
      setStatus(`${nomeVencedor} venceu! 🎉`);
      setPlacar(p => ({ ...p, [resultado.vencedor]: p[resultado.vencedor] + 1 }));
      setVencedores(resultado.linha);
    }
  }

  function procurarJogadaCritica(tabuleiroAtual, idJogador) {
    for (let i = 0; i < tamanhoGrid * tamanhoGrid; i++) {
      if (tabuleiroAtual[i] === null) {
        const temp = [...tabuleiroAtual];
        temp[i] = idJogador;
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
    const idMaquina = 1; 
    const idHumano = 0;  

    if (dificuldade === "facil") {
      posicao = livres[Math.floor(Math.random() * livres.length)];
    } else {
      posicao = procurarJogadaCritica(tabuleiroAtual, idMaquina); 
      if (posicao === -1) posicao = procurarJogadaCritica(tabuleiroAtual, idHumano); 
      if (posicao === -1) {
        const centro = Math.floor((tamanhoGrid * tamanhoGrid) / 2);
        if (tabuleiroAtual[centro] === null && dificuldade === "dificil") posicao = centro;
        else posicao = livres[Math.floor(Math.random() * livres.length)];
      }
    }

    const novo = [...tabuleiroAtual];
    novo[posicao] = idMaquina;
    setQuadrados(novo);
    
    const nomeMaquina = pokemonJogadores[idMaquina]?.nome || "Máquina";
    setHistorico(h => [...h, { posicao, msg: `Jogada ${h.length + 1}: ${nomeMaquina} na posição ${posicao}` }]);

    const resultado = calcularVencedor(novo, tamanhoGrid, sequenciaVitoria);
    if (resultado) finalizarJogo(resultado);
    else setTurno(0);
  }

  function handleClick(i) {
    if (status || quadrados[i] !== null || !pokemonJogadores[turno]) return;

    const novo = [...quadrados];
    novo[i] = turno;
    setQuadrados(novo);
    
    const nomeJogadorAtual = pokemonJogadores[turno]?.nome || `Jogador ${turno + 1}`;
    setHistorico(h => [...h, { posicao: i, msg: `Jogada ${h.length + 1}: ${nomeJogadorAtual} na posição ${i}` }]);

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
          jogadores={pokemonJogadores}
        />
      );
    }
    boardRows.push(<div key={r} className="board-row">{rowSquares}</div>);
  }

  return (
    <div className={`game-container container-${tamanhoGrid}x${tamanhoGrid}`}>
      
      {/* 3. PAINEL DE ESCOLHA DE POKÉMON ADAPTÁVEL */}
      <div className="pokemon-selector" style={{ width: "100%", marginBottom: "20px", background: "#f8f9fa", padding: "15px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
        <h4 style={{ textAlign: "center", marginBottom: "10px" }}>Batalha Pokémon!</h4>
        <div style={{ display: "flex", gap: "15px", margin: "10px 0", flexWrap: "wrap", justifyContent: "center" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 1: </label>
            <input 
              value={buscaP1} 
              onChange={e => setBuscaP1(e.target.value)} 
              style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} 
            />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 2: </label>
            <input 
              value={buscaP2} 
              onChange={e => setBuscaP2(e.target.value)} 
              style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} 
            />
          </div>
          {/* Exibe os campos do Jogador 3 e 4 condicionalmente */}
          {numJogadores === 4 && (
            <>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 3: </label>
                <input 
                  value={buscaP3} 
                  onChange={e => setBuscaP3(e.target.value)} 
                  style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} 
                />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 4: </label>
                <input 
                  value={buscaP4} 
                  onChange={e => setBuscaP4(e.target.value)} 
                  style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} 
                />
              </div>
            </>
          )}
        </div>
        <button 
          className="btn-primary" 
          onClick={() => carregarPokemons(buscaP1, buscaP2, buscaP3, buscaP4)}
          style={{ width: "100%", marginTop: "10px" }}
        >
          Alterar Pokémon
        </button>
        {erroApi && (
          <p style={{ color: "#dc3545", marginTop: "10px", fontWeight: "bold", textAlign: "center" }}>
            {erroApi}
          </p>
        )}
      </div>

      <div className="header">
        <h2>
          Vez de: <span style={{ color: turno === 0 ? "#007bff" : turno === 1 ? "#dc3545" : turno === 2 ? "#ffc107" : "#28a745" }}>
            {pokemonJogadores[turno]?.nome || "Carregando..."}
          </span>
        </h2>
        
        <div className="controls-header" style={{flexWrap: "wrap", marginBottom: "15px", justifyContent: "center"}}>
          <select className="select-dificuldade" value={tamanhoGrid} onChange={(e) => mudarTamanhoJogo(Number(e.target.value))}>
            <option value={3}>Malha: 3x3</option>
            <option value={5}>Malha: 5x5 (4 em linha)</option>
            <option value={7}>Malha: 7x7 (4 em linha)</option>
            <option value={9}>Malha: 9x9 (5 em linha)</option>
          </select>

          {tamanhoGrid === 9 && (
            <select className="select-dificuldade" value={numJogadores} onChange={(e) => mudarNumJogadores(Number(e.target.value))}>
              <option value={2}>2 Jogadores</option>
              <option value={4}>4 Jogadores</option>
            </select>
          )}

          <button 
            className="btn-secondary select-dificuldade" 
            onClick={() => { setContraMaquina(!contraMaquina); mudarTamanhoJogo(tamanhoGrid); }}
            disabled={numJogadores === 4}
            style={{background: contraMaquina ? "#007bff" : "#e4e6eb", color: contraMaquina ? "white" : "inherit"}}
          >
            {contraMaquina ? "🤖 VS Máquina (ON)" : "🧑‍🤝‍🧑 VS Máquina (OFF)"}
          </button>
          
          {contraMaquina && numJogadores === 2 && (
            <select className="select-dificuldade" value={dificuldade} onChange={(e) => setDificuldade(e.target.value)}>
              <option value="facil">Dif: Fácil</option>
              <option value="dificil">Dif: Difícil</option>
            </select>
          )}
        </div>
      </div>

      {/* RENDERIZAÇÃO DO PLACAR COM OS 4 JOGADORES */}
      <div className="scoreboard" style={{flexWrap: "wrap"}}>
        {[...Array(numJogadores)].map((_, index) => (
          <div className="score-box" key={index} style={{minWidth: "60px"}}>
            <span style={{ fontWeight: "bold" }}>
              {pokemonJogadores[index]?.nome || `J${index+1}`}
            </span>
            <strong>{placar[index]}</strong>
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

        <button onClick={() => setTela("menu")}>
          ⬅ Voltar
        </button>
      </div>
    );
  }

      {historico.length > 0 && (
        <div className="history">
          <h3>Histórico ({historico.length} jogadas)</h3>
          <ul>
            {historico.map((item, idx) => (
              <li key={idx}>{item.msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}