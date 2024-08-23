import Menu from "./component/menu";
import Router from "./routes";
import { BrowserRouter } from "react-router-dom";

function App() {

return (
  <BrowserRouter>
    <Menu />
      <Router />; 
  </BrowserRouter>  
  
);
}

export default App;
