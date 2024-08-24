//criar routes para o projeto
import { Routes, Route } from "react-router-dom";
import SendFatura from "../pages/sendFatura/index.js";




const Router = () => {
  return (
    <Routes>      
        <Route path="/" element={<SendFatura />} />        
    </Routes>
  );
}

export default Router;



