import './App.css';
import Releaselist from './components/Releaselist.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          ¯\_(ツ)_/¯
        </h1>
        <div style={{ display: "flex", flexDirection:"column"}}>
          <p style={{ fontSize: "18px" }} >Shrug is a private press</p>
          <p style={{ fontSize:"18px"}} >for the Holocene Epoch </p>
        </div>
      </header>
      <Releaselist className="release-list"/>
    </div>
  );
}

export default App;
