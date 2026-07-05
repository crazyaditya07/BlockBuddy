require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // This connects Hardhat to our local Ganache private blockchain
    ganache: {
      url: "http://127.0.0.1:7545",
      // Optional: Add accounts from Ganache here if needed for scripts,
      // but usually Hardhat can pick up the default ones if not specified.
    }
  }
};
