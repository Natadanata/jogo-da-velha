import { useState, useEffect, useRef } from "react";
import { BotaoReiniciar } from "./reiniciar";

/* Componente que renderiza cada quadrado individual do tabuleiro */
function Square({ valor, func, vencedor, tamanhoGrid, jogadores }) {
  let sizeClass = "square";
  if (tamanhoGrid === 7) sizeClass = "square-small";
  if (tamanhoGrid === 9) sizeClass = "square-small square-extra-small";

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
  
  const [turno, setTurno] = useState(0); 
  const [status, setStatus] = useState(null);

  const [placar, setPlacar] = useState({ 0: 0, 1: 0, 2: 0, 3: 0, "Empates": 0 });
  const [historico, setHistorico] = useState([]);
  const [vencedores, setVencedores] = useState([]);

  const [contraMaquina, setContraMaquina] = useState(false);
  const [dificuldade, setDificuldade] = useState("facil");

  const [pokemonJogadores, setPokemonJogadores] = useState([null, null, null, null]);
  
  // MODIFICAÇÃO: Deixei o Pikachu e o Eevee como padrão, mas você pode digitar QUALQUER nome aqui
  const [buscaP1, setBuscaP1] = useState("pikachu");
  const [buscaP2, setBuscaP2] = useState("eevee");
  const [buscaP3, setBuscaP3] = useState("mewtwo");
  const [buscaP4, setBuscaP4] = useState("gengar");
  const [erroApi, setErroApi] = useState("");

  // --- ESTADOS DA MÚSICA ---
  const [volume, setVolume] = useState(0.5); 
  const [mutado, setMutado] = useState(false);
  const audioRef = useRef(null);

  const caminhoMusica = "/music/BgPokemon.mp3"; 

  const sequenciaVitoria = tamanhoGrid === 3 ? 3 : (tamanhoGrid === 9 ? 5 : 4);

  // Inicialização do Áudio
  useEffect(() => {
    audioRef.current = new Audio(caminhoMusica);
    audioRef.current.loop = true; 
    audioRef.current.volume = volume;

    const iniciarAudio = () => {
      audioRef.current.play().catch(err => console.log("Aguardando interação para tocar áudio."));
      window.removeEventListener("click", iniciarAudio);
    };
    window.addEventListener("click", iniciarAudio);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.removeEventListener("click", iniciarAudio);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = mutado ? 0 : volume;
    }
  }, [volume, mutado]);

  // MODIFICAÇÃO: Agora ele carrega automaticamente os nomes que você escolheu nas variáveis de busca iniciais
  useEffect(() => {
    carregarPokemons(buscaP1, buscaP2, buscaP3, buscaP4);
  }, []);

  const handleVolumeChange = (e) => {
    const novoVolume = parseFloat(e.target.value);
    setVolume(novoVolume);
    if (novoVolume > 0) setMutado(false);
  };

  const alternarMute = () => {
    setMutado(!mutado);
  };

  async function fetchPokemon(nomePokemon) {
    try {
      // O PokeAPI aceita IDs (ex: 25) ou nomes (ex: lucario, rayquaza, ditto)
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
      const ultimaJogadaMaquina = novoHistorico.pop();
      const ultimaJogadaHumano = novoHistorico.pop();
      novoTabuleiro[ultimaJogadaMaquina.posicao] = null;
      novoTabuleiro[ultimaJogadaHumano.posicao] = null;
      setTurno(0);
    } else {
      const ultimaJogada = novoHistorico.pop();
      novoTabuleiro[ultimaJogada.posicao] = null;
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
      
      {/* Painel de Controle de Música de Fundo */}
      <div className="audio-controller" style={{ width: "100%", marginBottom: "15px", background: "#f1f3f5", padding: "10px 15px", borderRadius: "12px", border: "1px solid #dee2e6", display: "flex", alignItems: "center", justifyContent: "center", gap: "15px", flexWrap: "wrap" }}>
        <button 
          onClick={alternarMute} 
          style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ced4da", background: mutado ? "#e63946" : "#fff", color: mutado ? "#fff" : "#000", cursor: "pointer", fontWeight: "bold" }}
        >
          {mutado ? "🔇 Mutado" : "🔊 Som"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label htmlFor="volume-slider" style={{ fontSize: "14px", fontWeight: "bold" }}>Volume:</label>
          <input 
            id="volume-slider"
            type="range" 
            min="0" 
            max="1" 
            step="0.05" 
            value={mutado ? 0 : volume} 
            onChange={handleVolumeChange} 
            style={{ cursor: "pointer", accentColor: "#007bff" }}
          />
          <span style={{ fontSize: "12px", minWidth: "35px", textAlign: "right" }}>
            {mutado ? 0 : Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Painel de Escolha de Pokémon */}
      <div className="pokemon-selector" style={{ width: "100%", marginBottom: "20px", background: "#f8f9fa", padding: "15px", borderRadius: "12px", border: "1px solid #e0e0e0" }}>
        <h4 style={{ textAlign: "center", marginBottom: "10px" }}>Batalha Pokémon!</h4>
        <div style={{ display: "flex", gap: "15px", margin: "10px 0", flexWrap: "wrap", justifyContent: "center" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 1: </label>
            <input value={buscaP1} onChange={e => setBuscaP1(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} placeholder="Ex: rayquaza" />
          </div>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 2: </label>
            <input value={buscaP2} onChange={e => setBuscaP2(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} placeholder="Ex: lucario" />
          </div>
          {numJogadores === 4 && (
            <>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 3: </label>
                <input value={buscaP3} onChange={e => setBuscaP3(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} placeholder="Ex: ditto" />
              </div>
              <div>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Jogador 4: </label>
                <input value={buscaP4} onChange={e => setBuscaP4(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc", width: "110px" }} placeholder="Ex: lugia" />
              </div>
            </>
          )}
        </div>
        <button className="btn-primary" onClick={() => carregarPokemons(buscaP1, buscaP2, buscaP3, buscaP4)} style={{ width: "100%", marginTop: "10px" }}>
          Alterar Pokémon
        </button>
        {erroApi && <p style={{ color: "#dc3545", marginTop: "10px", fontWeight: "bold", textAlign: "center" }}>{erroApi}</p>}
      </div>

      {/* Header */}
      <div className="header">
        <h2>
          Vez de: <span style={{ color: turno === 0 ? "#007bff" : turno === 1 ? "#dc3545" : turno === 2 ? "#ffc107" : "#28a745" }}>
            {pokemonJogadores[turno]?.nome || "Carregando..."}
          </span>
        </h2>
        
        <div className="controls-header" style={{display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px", justifyContent: "center"}}>
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

      {/* Placar */}
      <div className="scoreboard" style={{display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "15px"}}>
        {[...Array(numJogadores)].map((_, index) => (
          <div className="score-box" key={index} style={{minWidth: "60px", padding: "5px", border: "1px solid #ccc", textAlign: "center"}}>
            <span style={{ fontWeight: "bold", display: "block" }}>
              {pokemonJogadores[index]?.nome || `J${index+1}`}
            </span>
            <strong>{placar[index]}</strong>
          </div>
        ))}
        <div className="score-box" style={{minWidth: "70px", padding: "5px", border: "1px solid #ccc", textAlign: "center"}}>
          <span style={{display: "block"}}>Empates</span>
          <strong>{placar["Empates"]}</strong>
        </div>
      </div>

      {/* Tabuleiro */}
      <div className="board">
        {boardRows}
      </div>

      {/* Mensagem de Fim de Jogo */}
      <div className="status-message">
        {status ? <h1>{status}</h1> : <h1 style={{visibility: "hidden"}}>_</h1>}
      </div>

      {/* PAINEL DE CONTROLES */}
      <div className="controls" style={{display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px"}}>
        <BotaoReiniciar
          setQuadrados={() => setQuadrados(Array(tamanhoGrid * tamanhoGrid).fill(null))}
          setEstado={() => setTurno(0)}
          setStatus={setStatus}
          setHistorico={setHistorico}
          setVencedores={setVencedores}
        />

        <button 
          onClick={desfazerJogada}
          disabled={historico.length === 0 || status !== null}
          style={{
            cursor: (historico.length === 0 || status !== null) ? "not-allowed" : "pointer",
            opacity: (historico.length === 0 || status !== null) ? 0.6 : 1
          }}
        >
          ↩ Voltar Jogada
        </button>
      </div>

      {/* Histórico de Jogadas */}
      {historico.length > 0 && (
        <div className="history" style={{marginTop: "20px"}}>
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