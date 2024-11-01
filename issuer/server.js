import express from "express";
import { VerifiableCredential, Jwt } from "@web5/credentials";
import KccCredential from "./kccCredential.js";

const app = express();
app.use(express.json());

// app.post("/credentials", async (req, res) => {
//   try {
//     /*****************************************************************
//      * Extract and validate the access token from Authorization header
//      ******************************************************************/
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) {
//       return res
//         .status(401)
//         .json({ errors: ["Authorization header required"] });
//     }

//     const tokenParts = authHeader.split("Bearer ");
//     if (tokenParts.length !== 2) {
//       return res
//         .status(401)
//         .json({ errors: ["Authorization header format is Bearer <token>"] });
//     }

//     const accessToken = tokenParts[1];
//     const storedCNonce = accessTokenToCNonceMap.get(accessToken);
//     if (!storedCNonce) {
//       return res
//         .status(401)
//         .json({ errors: ["Invalid or expired access token"] });
//     }

//     /**************************************************************
//      * Extract and validate the JWT and nonce from the proof object
//      **************************************************************/
//     const { proof } = req.body;
//     if (!proof || proof.proof_type !== "jwt" || !proof.jwt) {
//       return res.status(400).json({ errors: ["Invalid proof provided"] });
//     }

//     let customersDidUri, payload;

//     try {
//       const verificationResult = await Jwt.verify({ jwt: proof.jwt });
//       customersDidUri = verificationResult.payload.iss; // Customer's Decentralized Identifier string
//       if (storedCNonce === payload.nonce) {
//         accessTokenToCNonceMap.delete(accessToken);
//       } else {
//         return res.status(401).json({ errors: ["Invalid nonce in proof"] });
//       }
//     } catch (error) {
//       return res.status(401).json({ errors: ["Invalid JWT in proof"] });
//     }

//     /***********************************************
//      * Create and sign the credential
//      ************************************************/
//     const kccCredentialInstance = new KccCredential(
//       "US",
//       "Gold",
//       {
//         country: "CD",
//       },
//       {
//         id: "https://vc-to-dwn.tbddev.org/vc-protocol/schema/credential",
//         type: "JsonSchema",
//       },
//       [
//         {
//           kind: "document_verification",
//           checks: ["passport", "government-id", "bank-statement"],
//         },
//         {
//           kind: "proof-of-address",
//           checks: ["utility-bill", "credit-card-statement"],
//         },
//         {
//           kind: "biometric",
//           checks: ["face-recognition", "fingerprint"],
//         },
//         {
//           kind: "sanction_screening",
//           checks: ["PEP"],
//         },
//       ]
//     );

//     const known_customer_credential = await VerifiableCredential.create({
//       issuer: issuerBearerDid.uri, // Issuer's Decentralized Identifier string
//       subject: customersDidUri, // Customer's Decentralized Identifier string from the verified JWT
//       expirationDate: "2026-05-19T08:02:04Z",
//       data: {
//         countryOfResidence: kccCredentialInstance.data.countryOfResidence,
//         tier: kccCredentialInstance.data.tier, // optional
//         jurisdiction: kccCredentialInstance.data.jurisdiction, // optional
//       },
//       credentialSchema: kccCredentialInstance.credentialSchema,
//       evidence: kccCredentialInstance.evidence, // optional
//     });

//     const credential_token = await known_customer_credential.sign({
//       did: issuerBearerDid, // Signing with the issuer's bearer DID
//     });
//     /***********************************************
//      * Respond with the signed credential
//      ************************************************/
//     return res.status(200).json({ credential: credential_token });
//   } catch (error) {
//     /***********************************************
//      * Generic error handling
//      ************************************************/
//     return res.status(500).json({
//       errors: [`An unexpected error occurred: ${error.message}`],
//     });
//   }
// });

export { app as api };
