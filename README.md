# Task 4: Private Blockchain

## 1. Objective
The aim of this project is to set up a private blockchain using Ganache and create a simple decentralized message board application.

## 2. Tools Used
- Ganache (Private Local Blockchain)
- Solidity
- Hardhat (configured to connect to Ganache)
- React & Vite (Frontend UI)
- Ethers.js & MetaMask

## 3. Project Structure
- `contracts/PrivateMessageBoard.sol`: Smart contract allowing users to post messages.
- `hardhat.config.js`: Hardhat config pointing to the Ganache RPC URL (`http://127.0.0.1:7545`).
- `frontend/`: React app for interacting with the message board.

## 4. How to Run

### Step 1: Ganache Setup
1. Download and install Ganache UI or use the `ganache-cli`.
2. Start a new Workspace in Ganache.
3. Keep the default RPC Server URL (`http://127.0.0.1:7545`).
4. Add one of the provided private keys to your MetaMask wallet to have test ETH.

### Step 2: Deploy Contract
1. Open a terminal in the `Task-4-Private-Blockchain` folder.
2. Install dependencies: `npm install`
3. Deploy to Ganache: 
   ```bash
   npx hardhat run scripts/deploy.js --network ganache
   ```
4. Copy the deployed contract address.

### Step 3: Start Frontend
1. Open a terminal in `frontend/`.
2. Install dependencies: `npm install`
3. Open `src/App.jsx` and replace the `contractAddress` with your Ganache contract address.
4. Run the frontend: `npm run dev`
5. Ensure MetaMask is connected to your Ganache network (`http://127.0.0.1:7545`, Chain ID 1337).

## 5. Output Screenshots
*(Screenshots of Ganache, the React UI, and MetaMask are in the `Screenshots/` folder).*

## 6. Conclusion
This task was an excellent introduction to deploying smart contracts on an entirely private, local network. Ganache provides a fast and visual way to see block creation and transactions compared to public testnets.
