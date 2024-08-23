//criar routes para o projeto
import { Routes, Route } from "react-router-dom";
import SendFatura from "../pages/sendFatura/index.js";
import Dashboard from "../pages/dashboard/index.js";
import Lista from "../pages/lista/index.js";



const Router = () => {
  return (
    <Routes>      
        <Route path="/sendfatura" element={<SendFatura />} />
        <Route path="/dash" element={<Dashboard />} /> 
        <Route path="/" element={<Lista />} />   
    </Routes>
  );
}

export default Router;



