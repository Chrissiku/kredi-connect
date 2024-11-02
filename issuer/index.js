import { Web5 } from "@web5/api";
import { protocolDefinition } from "./protocol.js";
import { authorizeToDWN } from "../authorizationToDWN.js";
import { startLoading, stopLoading } from "../loading.js";
import { aliceDid } from "../wallet/did.js";
import { VerifiableCredential } from "@web5/credentials";
import KccCredential from "./kccCredential.js";

/**
 * Connects and registers with Web5 service.
 * @returns {Object} Web5 connection details including issuer DID and bearer DID.
 */
export async function connectToWeb5() {
  try {
    startLoading("Registering to Web5");
    const { did: issuerDid, web5 } = await Web5.connect({
      didCreateOptions: { dwnEndpoints: ["https://dwn.gcda.xyz"] },
      registration: {
        onSuccess: () => console.log("✅ Registration successful"),
        onFailure: (error) => console.error("❌ Registration failed", error),
      },
    });
    stopLoading();

    startLoading("Accessing bearer DID");
    const { did: issuerBearerDid } = await web5.agent.identity.get({
      didUri: issuerDid,
    });
    stopLoading();
    console.log("✅ Bearer DID accessed");

    return { issuerDid, web5, issuerBearerDid };
  } catch (error) {
    console.error("❌ Error connecting to Web5:", error.message);
    throw new Error("Failed to connect to Web5");
  }
}

/**
 * Configures protocol for DWN communication.
 * @param {Object} web5 Web5 instance.
 * @param {string} issuerDid Issuer DID.
 */
export async function configureProtocol(web5, issuerDid) {
  try {
    startLoading("Configuring protocol");
    const { protocol, status } = await web5.dwn.protocols.configure({
      message: { definition: protocolDefinition },
    });

    if (status.detail === "Accepted") {
      await protocol.send(issuerDid);
      stopLoading();
      console.log("✅ Protocol configured successfully");
      await authorizeToDWN(issuerDid);
    } else {
      throw new Error("Protocol configuration failed");
    }
  } catch (error) {
    stopLoading();
    console.error("❌ Protocol configuration failed:", error.message);
    throw error;
  }
}

/**
 * Generates a verifiable credential.
 * @param {Object} req Request object.
 * @param {Object} issuerBearerDid Issuer's bearer DID object.
 * @returns {string} Signed JWT of the verifiable credential.
 */
export async function generateCredential(req, issuerBearerDid) {
  try {
    const customerDid = aliceDid;
    const kccCredential = new KccCredential(
      "CD",
      "Gold",
      { country: "CD" },
      {
        id: "https://vc-to-dwn.tbddev.org/vc-protocol/schema/credential",
        type: "JsonSchema",
      },
      [
        {
          kind: "document_verification",
          checks: ["passport", "government-id", "bank-statement"],
        },
        {
          kind: "proof-of-address",
          checks: ["utility-bill", "credit-card-statement"],
        },
        { kind: "biometric", checks: ["face-recognition", "fingerprint"] },
        { kind: "sanction_screening", checks: ["PEP"] },
      ]
    );

    const credentialData = {
      issuer: issuerBearerDid.uri,
      subject: customerDid,
      expirationDate: "2026-05-19T08:02:04Z",
      data: kccCredential.data,
      credentialSchema: kccCredential.credentialSchema,
      evidence: kccCredential.evidence,
    };

    const credential = await VerifiableCredential.create(credentialData);
    const signedVcJwt = await credential.sign({ did: issuerBearerDid });

    return signedVcJwt;
  } catch (error) {
    console.error("❌ Error generating credential:", error.message);
    throw error;
  }
}

/**
 * Sends a verifiable credential to the customer's DWN.
 * @param {string} vc Signed verifiable credential JWT.
 * @param {Object} web5 Web5 instance.
 */
export async function sendToCustomerDWN(vc, web5) {
  try {
    startLoading("Creating record for Alice's DWN");
    const { record } = await web5.dwn.records.create({
      data: vc,
      message: {
        type: "credential",
        protocol: protocolDefinition.protocol,
        protocolPath: "credential",
        protocolRole: "issuer",
        schema: protocolDefinition.types.credential.schema,
        dataFormat: "application/vc+jwt",
        recipient: aliceDid,
      },
    });

    await record.send(aliceDid);
    stopLoading();
    console.log("✅ Credential sent to Alice");
  } catch (error) {
    stopLoading();
    console.error("❌ Error sending credential to DWN:", error.message);
    throw error;
  }
}

/**
 * Reads a record from Alice's DWN.
 * @param {Object} web5 Web5 instance.
 * Only if the issuer has the role of judge in the protocol, they they can process this request.
 */

export async function readRecord(web5) {
  console.log("Reading record on Alice's DWN");
  const response = await web5.dwn.records.query({
    form: aliceDid,
    message: {
      filter: {
        protocol: protocolDefinition.protocol,
        protocolPath: "credential",
        schema: protocolDefinition.types.credential.schema,
        dataFormat: "application/json",
      },
    },
  });

  console.log("response", response.records);
  response.records.forEach(async (record) => {
    const result = await record.data.json();
    const allRecords = { recordId: record.id, data: result };
    console.log("data", allRecords);
  });
}
