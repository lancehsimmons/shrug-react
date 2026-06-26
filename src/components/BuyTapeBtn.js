import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

function BuyButton({ price, title, releaseId }) {
  const [purchased, setPurchased] = useState(false);

  if (purchased) {
    return <p style={{color:"red", fontWeight:"bold"}}>Thanks for buying {title}!</p>;
  }

  return (
    <PayPalButtons
      style={{ layout: "horizontal", height: 35 }}
      //testing no server
      // createOrder={(data, actions) => {
      //   return actions.order.create({
      //     purchase_units: [{ amount: { value: price } }],
      //   });
      // }}
      
      //testing local server
      // createOrder={async () => {
      //   const res = await fetch("http://localhost:4000/api/orders", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ price }),
      //   });
      //   const order = await res.json();
      //   return order.id;
      // }}

      //testing no server
      // onApprove={(data, actions) => {
      //   return actions.order.capture().then(() => {
      //     // alert(`Thanks for buying ${title}!`);
      //     console.log(`thanks for buying ${title}`)
      //     setPurchased(true);
      //   });
      // }}

      //testing local server
      // onApprove={async (data) => {
      //   const res = await fetch(`http://localhost:4000/api/orders/${data.orderID}/capture`, {
      //     method: "POST",
      //   });
      //   const details = await res.json();
      //   if (details.status === "COMPLETED") {
      //     setPurchased(true);
      //   }
      // }}
      //create and approve running server with stock monitoring
      createOrder={async () => {
        const res = await fetch("http://localhost:4000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ releaseId }),
        });
        const order = await res.json();
        console.log("Order response:", order);
        return order.id;
      }}
      onApprove={async (data) => {
        const res = await fetch(`http://localhost:4000/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ releaseId }),
        });
        const details = await res.json();
        if (details.status === "COMPLETED") {
          setPurchased(true);
        }
      }}
    />
  );
}

export default BuyButton;