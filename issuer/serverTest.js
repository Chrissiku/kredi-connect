// server.js
import express from "express";
import {
  connectToWeb5,
  configureProtocol,
  generateCredential,
  sendToCustomerDWN,
} from "./indexTest.js";
import { startLoading, stopLoading } from "../loading.js";

const app = express();
app.use(express.json());

const config = {
  port: 3000,
};

let issuerBearerDid;
let issuerDidRes;
let web5Res;

// Connect to Web5 and configure protocol on startup
(async function initialize() {
  try {
    const {
      issuerDid,
      web5,
      issuerBearerDid: bearerDid,
    } = await connectToWeb5();
    await configureProtocol(web5, issuerDid);
    web5Res = web5;
    issuerDidRes = issuerDid;
    issuerBearerDid = bearerDid;
  } catch (error) {
    console.error("Initialization failed:", error.message);
    process.exit(1); // Exit if initialization fails
  }
})();

// Endpoint to send Hello World message
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Endpoint to handle credentials
app.post("/credentials", async (req, res) => {
  try {
    const credential = await generateCredential(req, issuerBearerDid);
    res.status(200).json({ credential });

    try {
      await sendToCustomerDWN(credential, web5Res);
    } catch (sendError) {
      console.error(`Error sending credential to DWN: ${sendError.message}`);
    }
  } catch (error) {
    res
      .status(500)
      .json({ errors: [`An unexpected error occurred: ${error.message}`] });
  }
});

// Start the server
startLoading("Starting issuer server");
app.listen(config.port, () => {
  console.log(`Issuer server running on port ${config.port}`);
  stopLoading();
});
