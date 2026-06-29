import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

function BuyFileButton({ price, title, releaseId, downloadUrls }) {
  const [purchased, setPurchased] = useState(false);

  if (purchased) {
    return (
      <div>
        <p style={{color:"red", fontWeight:"bold"}}>Thanks for buying {title}!</p>
        <ul>
          {downloadUrls.map((url, i) => (
            <li key={i}>
              <a href={url} download>Download {i + 1}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: "horizontal", height: 35 }}
      createOrder={async () => {
        const res = await fetch("http://localhost:4000/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ releaseId, purchase_type: "digital" }),
        });
        const order = await res.json();
        return order.orderID;
      }}
      onApprove={async (data) => {
        const res = await fetch(`http://localhost:4000/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const details = await res.json();
        if (details.status === "completed") {
          setPurchased(true);
        }
      }}
    />
  );
}

export default BuyFileButton;
