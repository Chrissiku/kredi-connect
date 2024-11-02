import { startLoading, stopLoading } from "./loading.js";

// Define an async function to handle authorization
export const authorizeToDWN = async (issuerDidUri) => {
  try {
    const url = `https://vc-to-dwn.tbddev.org/authorize?issuerDid=${issuerDidUri}`;

    startLoading("Authorizing to write on customer's DWN");
    const response = await fetch(url, { method: "GET" });
    stopLoading();

    if (!response.ok) {
      stopLoading();
      console.log("❌ You are not authorized to access the customer's DWN");
      throw new Error(`Authorization failed: ${response.statusText}`);
    }

    console.log("✅ You are authorized to access the customer's DWN");
    return console.log("✅ Granted ", issuerDidUri);
  } catch (error) {
    stopLoading();
    console.error("Error during authorization:", error);
  }
};
