import { PayPalButtons } from "@paypal/react-paypal-js";
import { useState } from "react";

function BuyFileButton({ price, title, releaseId }) {
  const [signedUrl, setSignedUrl] = useState(null);
  const [error, setError] = useState(null);

  if (signedUrl) {
    return (
      <div>
        <p style={{color:"red", fontWeight:"bold"}}>Thanks for buying {title}!</p>
        <a href={signedUrl} download>Download {title}</a>
      </div>
    );
  }

  return (
    <div>
      <PayPalButtons
        fundingSource="paypal"
        style={{ layout: "horizontal", height: 35, label: "buynow" }}
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
          if (details.status === "completed" && details.signedUrl) {
            setSignedUrl(details.signedUrl);
          } else {
            setError("Payment received but download link failed — please contact us.");
          }
        }}
      />
      {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
    </div>
  );
}

export default BuyFileButton;
