import React from "react";

const CardLoadingSolar = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div>
      <img
          width='200px' // Define o comprimento da imagem como 100px
          height='auto' // A altura será ajustada automaticamente de acordo com a largura definida
          alt='Logo'
          src='../media/loading.gif'
        />
      </div>
      <div style={{marginTop: '10px', textAlign: 'center' }}>
        <h3>Carregando...</h3>
      </div>
    </div>
  )
}

export {CardLoadingSolar}