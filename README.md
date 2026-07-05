# 🌿 BlockBuddy

BlockBuddy is a decentralized message board application built with a calming, interactive Zen Garden theme. Users can post messages permanently to a blockchain, causing a digital tree to grow branches and leaves dynamically in real-time as the feed expands.

---

## ✨ Features

- **Decentralized Messaging**: Messages are stored permanently and immutably on the blockchain.
- **Dynamic Tree Visualizer**: A custom SVG tree that grows in real-time. As the number of messages increases, the trunk becomes thicker, branches develop, and the canopy blooms with leaves.
- **Interactive Leaf Fall Effect**: A premium micro-animation that triggers falling leaves whenever a user posts a message.
- **Dual-Mode System**:
  - **Blockchain Mode**: Integrates with MetaMask and any Ethereum Virtual Machine (EVM) compatible blockchain (such as a local Ganache network, Sepolia testnet, or Mainnet).
  - **Simulation Sandbox**: Allows first-time users to instantly interact with the board using browser `localStorage` if they don't have MetaMask installed.
- **Dynamic Configuration**: No hardcoded contract addresses. The app dynamically reads the address from environment variables or lets the developer deploy it automatically.

---

## 🛠️ Technology Stack

- **Smart Contract**: Solidity
- **Development Environment**: Hardhat (for compiling, testing, and deploying contracts)
- **Local Blockchain**: Ganache
- **Frontend Core**: React 18 & Vite
- **Blockchain Interface**: Ethers.js (v6) & MetaMask
- **Styling**: Custom CSS (Vanilla CSS with a premium glassmorphic dark theme)

---

## 📂 Project Structure

```
├── contracts/
│   └── PrivateMessageBoard.sol   # Solidity smart contract
├── scripts/
│   └── deploy.js                 # Hardhat deployment script (saves address to frontend/.env)
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React dashboard & UI logic
│   │   ├── App.css               # Premium styling & animations
│   │   └── main.jsx
│   ├── .env.example              # Env template for public deployment
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite configuration
├── hardhat.config.js             # Hardhat network and compiler config
└── package.json                  # Root development dependencies
```

---

## 🚀 How to Run Locally

### Step 1: Start Ganache
1. Download and run the **Ganache UI** or install `ganache-cli`.
2. Start a new Workspace or Quickstart.
3. Keep the default RPC server URL (`http://127.0.0.1:7545`).
4. Import one of Ganache's test account private keys into MetaMask to get test ETH.

### Step 2: Deploy the Contract
1. Install root dependencies:
   ```bash
   npm install
   ```
2. Deploy the smart contract to the local Ganache network:
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```
   *Note: This automatically creates or updates the `frontend/.env` file with the newly deployed contract address.*

### Step 3: Run the Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the browser to the local URL (usually `http://localhost:5173`). Connect MetaMask to the local Ganache RPC network (`http://127.0.0.1:7545`, Chain ID `1337`).

---

## 🌐 Public Deployment Workflow

When deploying the project publicly for production:

1. **Deploy Contract**: Deploy the contract to a public network (like Sepolia or Ethereum Mainnet) using Hardhat:
   ```bash
   npx hardhat run scripts/deploy.js --network <public_network_name>
   ```
2. **Configure Frontend Host**: In your web hosting provider (e.g., Vercel, Netlify, or Cloudflare Pages), add the environment variable:
   - **Key**: `VITE_CONTRACT_ADDRESS`
   - **Value**: `0xYOUR_PUBLIC_DEPLOYED_CONTRACT_ADDRESS`
3. **Build Frontend**: Run the build script in your CI/CD pipeline or locally:
   ```bash
   npm run build
   ```
   *Vite will automatically inject the variable, allowing public users to connect their wallets and post messages directly to the contract without manual configuration.*
