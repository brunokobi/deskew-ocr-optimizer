import React from 'react';

const CardFatura = ({ titulo , valor}) => {
  console.log('teste', titulo )
  return (
    React.createElement('div', { className: 'card mb-0 border border-primary rounded', style: { maxWidth: '300px',minWidth:'200px' } },
      React.createElement('div', { className: 'card-header bg-info text-dark' },
        React.createElement('h5', { className: 'card-title  text-center fs-3 fw-bold' }, `${titulo } Total `),
      ),
      React.createElement('div', { className: 'card-body' },      
       
        React.createElement('p', { className: 'text-primary text-center fs-3 fw-bold'  }, `${valor}`)
      )
    )
  );
};

export default CardFatura;
