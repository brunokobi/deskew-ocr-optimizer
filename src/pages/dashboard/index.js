
import React,{useEffect} from 'react';
import Grafico from '../../component/charts';
import axios from 'axios';
import CardFatura from '../../component/cards';



function Dashboard() {
  const [data, setData] = React.useState(null);
  const [cosumo_total, setConsumoTotal] = React.useState(0);
  const [valor_total, setValorTotal] = React.useState(0);

  useEffect(() => {
    getFaturas();
  }, []); 

  const getFaturas = () => {
    // URL do endpoint onde você quer enviar o objeto
  const url = 'http://localhost:3333/grafico';

  //Enviando o objeto usando o método POST do Axios
 axios.get(url)
    .then(response => {
      console.log('Resposta do servidor:', response.data);  
      let resp = response.data;
      let data = [["Mês", "Consumo", "Valor"]];
      let somacosumo = 0;
      let somavalor = 0;
      resp.forEach(element => {
        data.push([element.mes_referencia, element.energia_eletrica_quantidade, element.valor_total]);
        let quantidade = parseInt(element.energia_eletrica_quantidade);
        somacosumo += quantidade;

        let valor = parseFloat(element.valor_total);
        somavalor += valor;       

      });
      setConsumoTotal(somacosumo);
      setValorTotal(somavalor);
      setData(data);
      
               
    }
    )
}
 


return ( 
  <div className="bg-light" style={{width: '100%',height:'500px'}}>
     <h1 className='text-center text-primary'>
      Dashboard</h1> 
      <div className="d-flex flex-wrap"> 
      {data && (
       <div  className="p-2">
        <CardFatura         
         titulo = {'Consumo'}         
          valor={cosumo_total}
        />
        </div>
      )}
        
       

      {data && (
       <div  className="p-2">
        <CardFatura         
        titulo = {'Valor'}         
        valor={valor_total}
        />
        </div>
       
       
      )}

      </div>
      
      {data ?(
        <Grafico
        faturas = {data}
        />
         ):(
        <div>
          <h1>Carregando...</h1>
          </div>
        )}
  </div>

    




 
);
}

export default Dashboard;


