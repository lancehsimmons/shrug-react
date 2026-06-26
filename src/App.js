import './App.css';
import Releaselist from './components/Releaselist.js';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          ¯\_(ツ)_/¯
        </h1>
        <div style={{ display: "flex", flexDirection:"column", marginLeft: "8px"}}>
          <p style={{ fontSize: "18px" }} >Shrug is a private press</p>
          <p style={{ fontSize:"18px"}} >for the Holocene Epoch</p>
          <p style={{ fontSize:"14px"}} >¯\_(ツ)_/¯¯\_(ツ)_/¯¯\_(ツ)_/¯</p>
        </div>
      </header>
      {/* <Releaselist className="release-list"/>
       */}
      <PayPalScriptProvider options={{ clientId: "AQZjArrSxsgLKxn-k4s3a927C2xkdsGDVDzmnicKuj-xlEdolFLqQwkjwEJ1cnvzOg28RwBM9Xkp-ZNi" }}>
      <Releaselist className="release-list"/>
    </PayPalScriptProvider>
    </div>
  );
}
// function App() {
//   return (
//     <PayPalScriptProvider options={{ clientId: "AQZjArrSxsgLKxn-k4s3a927C2xkdsGDVDzmnicKuj-xlEdolFLqQwkjwEJ1cnvzOg28RwBM9Xkp-ZNi" }}>
//       <PayPalButtons
//         createOrder={(data, actions) => {
//           return actions.order.create({
//             purchase_units: [{ amount: { value: "10.00" } }],
//           });
//         }}
//         onApprove={(data, actions) => {
//           return actions.order.capture().then(() => {
//             alert("Payment completed!");
//           });
//         }}
//       />
//     </PayPalScriptProvider>
//   );
// }

export default App;
