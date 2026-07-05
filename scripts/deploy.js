const hre = require("hardhat");

async function main() {
  // Get the smart contract factory
  const MessageBoard = await hre.ethers.getContractFactory("PrivateMessageBoard");
  
  // Deploy the contract to the Ganache network
  const board = await MessageBoard.deploy();
  
  // Wait for it to be deployed
  await board.waitForDeployment();
  
  // Print out the deployed address
  console.log(`PrivateMessageBoard deployed to: ${board.target}`);

  // Automatically save/update the address in the frontend/.env file
  const fs = require("fs");
  const path = require("path");
  const envPath = path.join(__dirname, "../frontend/.env");
  fs.writeFileSync(envPath, `VITE_CONTRACT_ADDRESS=${board.target}\n`);
  console.log(`Saved contract address to frontend/.env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
