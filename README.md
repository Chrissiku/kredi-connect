# KrediConnect - Know Customer Credentials (KCC) Issuer Server

Welcome to the KrediConnect project. This repository contains a server application for interacting with the Web5 platform to issue, configure, and manage customer credentials on a Decentralized Web Node (DWN). It also allows secure communication and verification of customer credentials.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Key Files and Modules](#key-files-and-modules)
4. [API Endpoints](#api-endpoints)
5. [Usage Instructions](#usage-instructions)
6. [Error Handling](#error-handling)
7. [Contributing](#contributing)

---

## Overview

The KrediConnect , a KCC Issuer server, connects to the Web5 to register an issuer, create know customer credentials, and securely send them to customer DWNs. This process ensures that customer data remains secure and verifiable through cryptographic proofs.

---

## Getting Started

### Prerequisites

- Node.js (version 18+)
- NPM or Yarn
- Web5 and Google cloud Free DWN configurations

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/kredi-connect.git
   cd kredi-connect
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the server:**
   ```bash
   npm run start
   ```

The server will start at `http://localhost:3000`.

---

## Key Files and Modules

### 1. **`index.js`**

- Core logic for connecting and registering with Web5, configuring protocols, generating credentials, and communicating with DWN.
- Functions:
  - **`connectToWeb5`**: Establishes a connection with Web5, registers the DID, and retrieves bearer details.
  - **`configureProtocol`**: Sets up the required protocol configuration on DWN.
  - **`generateCredential`**: Creates a verifiable credential in JSON Web Token (JWT) format.
  - **`sendToCustomerDWN`**: Sends the verifiable credential to a customer’s DWN.
  - **`readRecord`**: Reads and retrieves records stored in DWN.

### 2. **`server.js`**

- Express-based server configuration with endpoints to interact with the Web5 and DWN systems.
- Routes:
  - **`POST /credentials`**: Issues a verifiable credential to a customer.
  - **`GET /records`**: Fetches all records from DWN.
  - **`GET /records/:recordId`**: Retrieves a specific record by ID.

### 3. **Other Modules**

- **`protocol.js`**: Defines the DWN protocol settings.
- **`authorizationToDWN.js`**: Manages authorization logic for DWN.
- **`loading.js`**: Manages loading states for asynchronous processes.
- **`did.js`**: Provides DID configurations for various entities.

---

## API Endpoints

### `POST /credentials`

Generates a verifiable credential for a customer based on the request payload.

- **Response**: Returns the signed credential in JWT format.
- **Error**: 500 on failure with an error message.

### `GET /records`

Fetches all available records from DWN.

- **Response**: JSON object containing a list of all records.
- **Error**: 500 on failure with an error message.

### `GET /records/:recordId`

Retrieves a specific record using the provided `recordId`.

example : http://localhost:3000/records/bafyreidtnd52fyekrt2s3q4yibh5bxwtpg4y2bkgivhxymxesgyezevyie

- **Response**: Returns the jwt of the specified record, wich is a KCC.
- **Error**: 404 if the record is not found, 500 on internal error.

---

## Usage Instructions

1. **Initialize Web5 Connection**: The `initialize` function in `server.js` automatically connects to Web5 and configures the protocol on startup.
2. **Issue Credentials**:
   - Use the `/credentials` endpoint to generate and send a verifiable credential to a customer.
3. **Retrieve Records**:
   - Use `/records` to list all stored records or `/records/:recordId` to retrieve specific records.

---

## Error Handling

- Each function is wrapped in `try-catch` blocks to handle errors.
- Errors are logged to the console and appropriate HTTP status codes and messages are sent to the client.
- If the Web5 connection fails during startup, the server will log the error and terminate.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository.
2. Create a feature branch.
3. Submit a pull request with a detailed description of the changes.

---

## License

This project is [LICENSE](./LICENSE) under the MIT License.

For questions or support, please contact the maintainers.
