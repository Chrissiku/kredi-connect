import express from "express";
import {
  connectToWeb5,
  configureProtocol,
  generateCredential,
  sendToCustomerDWN,
  readRecord,
} from "./index.js";
import { startLoading, stopLoading } from "../loading.js";
import { VerifiableCredential } from "@web5/credentials";

const app = express();
app.use(express.json());

const config = { port: 3000 };
let issuerBearerDid, web5Res;

/**
 * Initialize Web5 connection and configure protocol on startup.
 */
(async function initialize() {
  try {
    const {
      issuerDid,
      web5,
      issuerBearerDid: bearerDid,
    } = await connectToWeb5();
    await configureProtocol(web5, issuerDid);
    web5Res = web5;
    issuerBearerDid = bearerDid;
    console.log("✅ Initialization successful");
  } catch (error) {
    console.error("Initialization failed:", error.message);
    process.exit(1); // Exit if initialization fails
  }
})();

// Endpoint to handle credential requests
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

// Root endpoint
app.get("/", (req, res) =>
  res.send(
    "Welome to KrediConnect, the Know Customer Credentials (KCC) Issuer server"
  )
);

// Read all records

// Endpoint to handle credential requests
app.get("/records", async (req, res) => {
  try {
    const data = await readRecord(web5Res);
    res.status(200).json({ data });
  } catch (error) {
    res
      .status(500)
      .json({ errors: [`An unexpected error occurred: ${error.message}`] });
  }
});

app.get("/parse", async (req, res) => {
  const signedVcJwt = req.query.credential;
  try {
    const vc = VerifiableCredential.parseJwt({ vcJwt: signedVcJwt });
    if (!signedVcJwt) {
      return res.status(400).json({ error: "crendetial is required" });
    }

    if (!vc) {
      return res.status(404).json({ error: "Credetial not found" });
    }

    res.json({ data: vc });
  } catch (error) {
    console.error("❌ Error parsing credential:", error.message);
    throw error;
  }
});

// read single record
app.get("/records/:recordId?", async (req, res) => {
  try {
    // Get recordId from either the route parameter or the request body
    const recordId = req.params.recordId || req.body.recordId;

    if (!recordId) {
      return res.status(400).json({ error: "recordId is required" });
    }

    // Fetch the record using the provided recordId
    const { record: singleRecord } = await web5Res.dwn.records.read({
      message: {
        filter: {
          recordId: recordId,
        },
      },
    });

    // Check if singleRecord exists
    if (!singleRecord) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Send the record data as a response
    const dataText = await singleRecord.data.text();
    res.json({ credential: dataText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(config.port, () => {
  console.log(`Issuer server running on http://localhost:${config.port}`);
  stopLoading();
});
