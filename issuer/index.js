import { Web5 } from "@web5/api";
import { protocolDefinition } from "./protocol.js";
import { authorizeToDWN } from "../authorizationToDWN.js";
import { startLoading, stopLoading } from "../loading.js";
import { aliceDid } from "../wallet/did.js";
import { api } from "./server.js";

const config = {
  port: 3000,
};

startLoading("Registering to Web5");
export const { did: issuerDid, web5 } = await Web5.connect({
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

// Access bearer did
const { did: issuerBearerDid } = await web5.agent.identity.get({
  didUri: issuerDid,
});

// install vc protocol on my web5 instance
const vcProtocol = protocolDefinition;

startLoading("Configuring protocol");
const { protocol, status } = await web5.dwn.protocols.configure({
  message: { definition: vcProtocol },
});

if (status.detail === "Accepted") {
  await protocol.send(issuerDid);
  stopLoading();
  console.log("✅ Protocol configured successfully");
  await authorizeToDWN(issuerDid);
  // await readRecord();
} else {
  stopLoading();
  console.error("❌ Protocol configuration failed");
}

// Read Record on Alice's DWN

// async function readRecord() {
//   console.log("Reading record on Alice's DWN");
//   const response = await web5.dwn.records.query({
//     form: aliceDid,
//     message: {
//       filter: {
//         protocol: protocolDefinition.protocol,
//         schema: protocolDefinition.types.credential.schema,
//         dataFormat: "application/json",
//       },
//     },
//   });

//   console.log("response", response.records);
//   response.records.forEach(async (record) => {
//     const result = await record.data.json();
//     const allRecords = { recordId: record.id, data: result };
//     console.log("data", allRecords);
//   });
// }

// bafyreidtnd52fyekrt2s3q4yibh5bxwtpg4y2bkgivhxymxesgyezevyie

const { record: singleRecord } = await web5.dwn.records.read({
  message: {
    filter: {
      recordId: "bafyreidtnd52fyekrt2s3q4yibh5bxwtpg4y2bkgivhxymxesgyezevyie",
    },
  },
});

console.log(await singleRecord.data.text());
