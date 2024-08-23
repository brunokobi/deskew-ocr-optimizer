import React from "react";
import { Chart } from "react-google-charts";

export function Grafico(faturas) {

  const  data = faturas.faturas;  
  
  const options = {
    chart: {
      title: "Consumo e Valor por Mês",
      subtitle: "",
    },
  };

  return (
    <div className="container h-100 m-5">
    <div className="row h-100 justify-content-center align-items-center">
     
   
    <Chart
      chartType="Bar"
      width="80%"
      height="400px"
      data={data}
      options={options}     
    />    
   
    </div>   
    </div>
  );
}

export default Grafico;
