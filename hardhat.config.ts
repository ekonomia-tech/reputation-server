/**
 * @type import('hardhat/config').HardhatUserConfig
 */


import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import { task, HardhatUserConfig } from "hardhat/config";

import 'dotenv/config'

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || "";

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {},
		rinkeby: {
			url: `https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
			accounts: [`${RINKEBY_PRIVATE_KEY}`],
		}
	},	
	solidity: "0.8.13"
}

export default config;

