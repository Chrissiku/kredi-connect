import { Web5 } from "@web5/api";
import { protocolDefinition } from "./protocol.js";
import { authorizeToDWN } from "../authorizationToDWN.js";
import { startLoading, stopLoading } from "../loading.js";

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
} else {
  stopLoading();
  console.error("❌ Protocol configuration failed");
}
