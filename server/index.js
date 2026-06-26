require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PAYPAL_API = "https://api-m.sandbox.paypal.com";


const releases = [
  {
    "id": 1,
    "title": "Structured Water",
    "physprice": "15.00",
    "fileprice": "6.00",
    "stock":12
  },
  {
    "id": 2,
    "title": "soiled top spin",
    "physprice": "15.00",
    "fileprice": "6.00",
    "stock":0
  }
];

//read-only stock endpoint
app.get("/api/releases", (req, res) => {
  res.json(releases.map(({ id, stock }) => ({ id, stock })));
});

// Asks PayPal for a temporary access pass, using your secret key
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

// Browser calls this when someone clicks "Buy"
// app.post("/api/orders", async (req, res) => {
//   const { price } = req.body;
//   const accessToken = await getAccessToken();

//   const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
//     body: JSON.stringify({
//       intent: "CAPTURE",
//       purchase_units: [{ amount: { currency_code: "USD", value: price } }],
//     }),
//   });
//   res.json(await response.json());
// });
app.post("/api/orders", async (req, res) => {
  const { releaseId } = req.body;
  const release = releases.find((r) => r.id === releaseId);

  if (!release) return res.status(404).json({ error: "Release not found" });
  if (release.stock <= 0) return res.status(400).json({ error: "Sold out" });

  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: release.price } }],
    }),
  });
  res.json(await response.json());
});

// Browser calls this after the buyer approves, to finish the payment
// app.post("/api/orders/:orderID/capture", async (req, res) => {
//   const accessToken = await getAccessToken();
//   const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${req.params.orderID}/capture`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
//   });
//   res.json(await response.json());
// });
app.post("/api/orders/:orderID/capture", async (req, res) => {
  const { releaseId } = req.body;
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${req.params.orderID}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
  });
  const details = await response.json();

  if (details.status === "COMPLETED") {
    const release = releases.find((r) => r.id === releaseId);
    if (release && release.stock > 0) release.stock -= 1;
  }

  res.json(details);
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));