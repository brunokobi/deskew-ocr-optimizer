//criar routes para o projeto
import { Routes, Route } from "react-router-dom";
import Deskew from "../pages/deskew/index.js";




const Router = () => {
  return (
    <Routes>      
        <Route path="/" element={<Deskew />} />        
    </Routes>
  );
}

export default Router;



