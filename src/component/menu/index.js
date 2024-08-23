import React from 'react';


function Menu() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
       <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
       <img
          width='40px' // Define o comprimento da imagem como 100px
          height='auto' // A altura será ajustada automaticamente de acordo com a largura definida
          alt='Logo'
          src='../media/loading.gif'
          className='d-inline-block align-top mx-2'
        />
    
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav">

          <li className="nav-item">
          <a className="nav-link text-primary border border-primary rounded mx-1" href="/dash">Dashboard</a>
          </li>        

          <li className="nav-item">
            <a className="nav-link text-primary border border-primary rounded mx-1" href="/">Lista</a>
          </li>

          <li className="nav-item">
            <a className="nav-link text-primary border border-primary rounded mx-1" href="/sendfatura">Enviar fatura</a>
          </li>

        </ul>
      </div>
    </nav>
  );
}

export default Menu;
