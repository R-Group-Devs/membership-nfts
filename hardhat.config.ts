import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const accounts =
  process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    ropsten: { url: process.env.ROPSTEN_URL || "", accounts },
    rinkeby: { url: process.env.RINKEBY_URL || "", accounts },
    goerli: { url: process.env.GOERLI_URL || "", accounts },
    eth: { url: process.env.ETH_URL || "", accounts },
    mumbai: { url: process.env.MUMBAI_URL || "", accounts },
    polygon: { url: process.env.POLYGON_URL || "", accounts },
    xdai: { url: process.env.XDAI_URL || "", accounts },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
    // when on etherscan: process.env.ETHERSCAN_API_KEY
    // when on polygonscan: process.env.POLYGONSCAN_API_KEY
  },
};

export default config;
