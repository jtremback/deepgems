import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "hardhat-typechain";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.7.6",
  gasReporter: {
    currency: "USD",
    coinmarketcap: "a3870d7b-a01f-4ad3-8810-1baefaa7ba4d",
  },
};

export default config;
