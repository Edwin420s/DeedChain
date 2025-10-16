require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

const { PRIVATE_KEY, LINEA_RPC_URL, ETHERSCAN_API_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    linea: {
      url: LINEA_RPC_URL || "https://rpc.linea.build",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59144,
    },
    linea_testnet: {
      url: LINEA_RPC_URL || "https://rpc.goerli.linea.build",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 59140,
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },
  etherscan: {
    apiKey: {
      linea: ETHERSCAN_API_KEY || "",
      linea_testnet: ETHERSCAN_API_KEY || ""
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};