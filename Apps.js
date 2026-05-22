import { useState } from 'react';  

function Square({valor, func}) {
  return <button className="square" onClick={func}>{valor}</button>
}

export default function Campo() {
  const [quadrados, setQuadrados] = useState(Array(9).fill(null));
  const [estado, setEstado] = useState(false);
  const [status, setStatus] = useState(null);
  function calcularVencedor() {
    if ((quadrados[0]=="X" && quadrados[1]=="X" && quadrados[2]=="X")
      || (quadrados[3]=="X" && quadrados[4]=="X" && quadrados[5]=="X")
      || (quadrados[6]=="X" && quadrados[7]=="X" && quadrados[8]=="X")
    ) {
      console.log("Jogador 1 Venceu!");
      return "Jogador 1 venceu!";
    } else if ((quadrados[0]=="O" && quadrados[1]=="O" && quadrados[2]=="O")
      || (quadrados[3]=="O" && quadrados[4]=="O" && quadrados[5]=="O")
      || (quadrados[6]=="O" && quadrados[7]=="O" && quadrados[8]=="O")
    ) {
        console.log("Jogador 2 Venceu!");
        return "Jogador 2 venceu!";
    } else if (
      quadrados[0]!=null &&
      quadrados[1]!=null &&
      quadrados[2]!=null &&
      quadrados[3]!=null &&
      quadrados[4]!=null &&
      quadrados[5]!=null &&
      quadrados[6]!=null &&
quadrados[7]!=null &&
quadrados[8]!=null
    ) {
      console.log("Deu empate!");
      return "Deu empate!";
    }
    return null;
  }

  function handleClick(i) {
    const quadradoTemp = quadrados.slice();
    if (quadradoTemp[i]!=null) {
      return;
    }

    if (estado==false) {
      quadradoTemp[i] = "X";
    } else {
      quadradoTemp[i] = "O";
    }
    setQuadrados(quadradoTemp);
    setEstado(!estado);

    setStatus(calcularVencedor());
  }
  return <>
    <div class="board-row">
      <Square valor={quadrados[0]} func={() => handleClick(0)} />
      <Square valor={quadrados[1]} func={() =>handleClick(1)}/>
      <Square valor={quadrados[2]} func={() =>handleClick(2)}/>
    </div>
    <div class="board-row">
      <Square valor={quadrados[3]} func={() =>handleClick(3)}/>
      <Square valor={quadrados[4]} func={() =>handleClick(4)}/>
      <Square valor={quadrados[5]} func={() =>handleClick(5)}/>
    </div>
    <div class="board-row">
      <Square valor={quadrados[6]} func={() =>handleClick(6)}/>
      <Square valor={quadrados[7]} func={() =>handleClick(7)}/>
      <Square valor={quadrados[8]} func={() =>handleClick(8)}/>  
    </div>
    <div><h1>{status}</h1></div>
  </>;
} 