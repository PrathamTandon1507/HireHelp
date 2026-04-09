require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: '../.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      chainId: 1337 // Standard local network id
    },
    sepolia: {
      url: process.env.BLOCKCHAIN_RPC_URL || "",
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY]               
    }
  }
};
