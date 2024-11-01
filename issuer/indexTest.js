// index.js
import { Web5 } from "@web5/api";
import { protocolDefinition } from "./protocol.js";
import { authorizeToDWN } from "../authorizationToDWN.js";
import { startLoading, stopLoading } from "../loading.js";
import { aliceDid } from "../wallet/did.js";
import { Jwt, VerifiableCredential } from "@web5/credentials";
import KccCredential from "./kccCredential.js";

// Connect and register to Web5
export async function connectToWeb5() {
  startLoading("Registering to Web5");
  const { did: issuerDid, web5 } = await Web5.connect({
    didCreateOptions: {
      dwnEndpoints: ["https://dwn.gcda.xyz"],
    },
    registration: {
      onSuccess: () => {
        stopLoading();
        console.log("✅ Registration successful");
      },
      onFailure: (error) => {
        stopLoading();
        console.error("❌ Registration failed", error);
      },
    },
  });

  startLoading("Accessing bearer DID");
  const { did: issuerBearerDid } = await web5.agent.identity.get({
    didUri: issuerDid,
  });
  stopLoading();
  console.log("✅ Bearer DID accessed");

  return { issuerDid, web5, issuerBearerDid };
}

// Configure protocol
export async function configureProtocol(web5, issuerDid) {
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
    stopLoading();
    console.error("❌ Protocol configuration failed");
    throw new Error("Protocol configuration failed");
  }
}

// Generate credential
export async function generateCredential(req, issuerBearerDid) {
  let customersDidUri = aliceDid;
  const kccCredentialInstance = new KccCredential(
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

  const knownCustomerCredential = await VerifiableCredential.create({
    issuer: issuerBearerDid.uri,
    subject: customersDidUri,
    expirationDate: "2026-05-19T08:02:04Z",
    data: {
      countryOfResidence: kccCredentialInstance.data.countryOfResidence,
      tier: kccCredentialInstance.data.tier,
      jurisdiction: kccCredentialInstance.data.jurisdiction,
    },
    credentialSchema: kccCredentialInstance.credentialSchema,
    evidence: kccCredentialInstance.evidence,
  });

  const signedVcJwt = await knownCustomerCredential.sign({
    did: issuerBearerDid,
  });

  //   await sendToCustomerDWN(signedVcJwt, web5);
  //   const vc = VerifiableCredential.parseJwt({ vcJwt: signedVcJwt });

  return signedVcJwt;
}

// Send to Customer's DWN
export async function sendToCustomerDWN(vc, web5) {
  startLoading("Creating record to Alice's DWN");
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
  stopLoading();

  console.log(record);
  // send to alice's DWN
  startLoading("Sending credential to Alice's DWN");
  await record.send(aliceDid);
  stopLoading();
  console.log("✅ Credential sent to Alice");

  //   await readRecordOnAliceDWN(web5);
  return;
}
