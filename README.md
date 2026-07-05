# 🌿 BlockBuddy

BlockBuddy is a decentralized message board dApp that combines blockchain storage with a calming, interactive Zen Garden theme. As users post immutable messages to the blockchain, a digital tree grows branches and leaves in real-time, visualizing the community's expanding voice.

![BlockBuddy UI](docs/blockbuddy_ui.png)

## 🔗 Live Demo
* **Frontend Web App**: [https://blockbuddy-rust.vercel.app/](https://blockbuddy-rust.vercel.app/) *(Placeholder: Replace with your actual deployed Vercel URL)*
* **Deployed Smart Contract**: [0xYOUR_SEPOLIA_CONTRACT_ADDRESS](https://sepolia.etherscan.io/address/0xYOUR_SEPOLIA_CONTRACT_ADDRESS) on Sepolia Testnet

---

## ⚙️ How It Works

BlockBuddy operates in two distinct modes depending on your setup. If MetaMask is connected and pointed to a supported EVM blockchain (like Sepolia or local Ganache), messages are written directly to a smart contract, incurring gas fee transactions and storing data permanently on-chain. If no Web3 provider is detected or if you switch to Simulation Sandbox mode, the app runs entirely in your browser using local storage. This dual-mode structure ensures that anyone can interact with the growing tree visualization immediately, even without Web3 experience.

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity
- **Deployment & Config**: Hardhat, Dotenv, Ethers.js
- **Frontend**: React 18, Vite
- **Styling & UI**: Vanilla CSS (Premium Glassmorphic Dark Theme)
- **License**: MIT [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Local Setup (Ganache Network)

### Step 1: Ganache Configuration
1. Start Ganache UI or run `ganache-cli`.
2. Ensure the RPC server is running at `http://127.0.0.1:7545` (Chain ID `1337`).
3. Import a private key from Ganache to your MetaMask extension.

### Step 2: Deploy Contract
1. Run `npm install` in the project root to install Hardhat and plugins.
2. Deploy the smart contract locally:
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```
   *Note: This automatically writes the newly deployed contract address to `frontend/.env`.*

### Step 3: Start the Frontend
1. Navigate to the `frontend/` directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the local server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 🌐 Public Deployment (Sepolia Testnet)

1. Create a `.env` file at the project root based on `.env.example`:
   ```env
   SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   DEPLOYER_PRIVATE_KEY=YOUR_TESTNET_PRIVATE_KEY
   ```
   *Warning: Never commit your `.env` file or use a private key with real funds.*
2. Deploy the contract:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
3. Copy the contract address from the logs and update your hosting environment variables (`VITE_CONTRACT_ADDRESS`) to point to the Sepolia deployment.

---

## ⚠️ Known Limitations & Design Decisions

- **Immutability by Design**: There is no message deletion or moderation capability built into the smart contract. All posted messages are stored on-chain permanently. This is a deliberate architectural tradeoff representing censorship resistance and true decentralization, rather than a bug.
- **Gas Costs**: Running on-chain requires gas fees for every post. Users must have Sepolia testnet ETH (or network-specific coins) to interact in Live Mode.
