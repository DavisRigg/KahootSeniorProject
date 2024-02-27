import './App.css';
//import { socket } from './socket';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from './pages/Home';
import { Host } from './pages/Host';

function App() {

  return (
    <Router> 
        <Routes> 
                <Route exact path='/' element={< Home />}></Route> 
                <Route exact path='/host' element={< Host />}></Route> 
        </Routes> 
    </Router> 
  );
}

export default App;
