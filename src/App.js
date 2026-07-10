import { useState, useEffect, useRef } from "react";

export default function App() {
  const [tela, setTela] = useState("menu");
  const [musica, setMusica] = useState("");
  const [fundo, setFundo] = useState("");

  const audio = useRef(null);

  useEffect(() => {
    if (audio.current) {
      audio.current.pause();
    }

    if (musica !== "") {
      audio.current = new Audio(musica);
      audio.current.loop = true;
      audio.current.volume = 0.5;

      audio.current.play().catch(() => {
        console.log("Clique em um botão para liberar o áudio.");
      });
    }
  }, [musica]);

  function escolherImagem(e) {
    const arquivo = e.target.files[0];

    if (!arquivo) return;

    setFundo(URL.createObjectURL(arquivo));
  }

  if (tela === "menu") {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          backgroundImage: fundo ? `url(${fundo})` : "",
          backgroundSize: "cover"
        }}
      >
        <h1>🎮 Jogo da Velha</h1>

        <button onClick={() => setTela("jogo")}>
          ▶ PLAY
        </button>

        <button onClick={() => setTela("config")}>
          ⚙ CONFIGURAÇÕES
        </button>
      </div>
    );
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
}