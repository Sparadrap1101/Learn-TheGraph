require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "https://eth-mumbai.alchemyapi";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const GANACHE_RPC_URL = process.env.GANACHE_RPC_URL;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    mumbai: {
      chainId: 80001,
      blockConfirmations: 6,
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
    localhost: {
      chainId: 1337,
      url: GANACHE_RPC_URL,
      live: false,
      saveDeployments: false,
      tags: ["local"],
    },
  },

  etherscan: {
    apiKey: {
      polygonMumbai: ETHERSCAN_API_KEY,
    },
  },

  solidity: "0.8.18",

  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
};
