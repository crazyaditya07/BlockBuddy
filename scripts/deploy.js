const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const networkName = hre.network.name;
  console.log(`Starting deployment to network: ${networkName}...`);

  // Get the smart contract factory
  const MessageBoard = await hre.ethers.getContractFactory("PublicMessageBoard");
  
  // Deploy the contract
  const board = await MessageBoard.deploy();
  
  // Wait for deployment
  await board.waitForDeployment();
  
  const deployedAddress = board.target;
  console.log(`PublicMessageBoard deployed successfully to network "${networkName}" at address: ${deployedAddress}`);

  // Automatically save/update the address in the frontend/.env file
  const envPath = path.join(__dirname, "../frontend/.env");
  fs.writeFileSync(envPath, `VITE_CONTRACT_ADDRESS=${deployedAddress}\n`);
  console.log(`Saved contract address to frontend/.env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
