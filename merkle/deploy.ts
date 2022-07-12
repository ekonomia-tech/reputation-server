

import { ethers } from "hardhat";
import { config } from "dotenv";
import * as contractAbi from  "../abis/ReputationMerkleTree.json";
import { ContractData } from "../common/types";


config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY || "";
const RINKEBY_CONTRACT_ADDRESS = process.env.RINKEBY_CONTRACT_ADDRESS || "";

export async function deployMerkleRoot(_root: string, _cid: string) : Promise<void> {
    const { contract } : ContractData = getContractData();
    await contract.setMerkleRoot(_root, _cid);
    await logMerkleRoot();}

export async function logMerkleRoot() : Promise<void> {
    const { contract } = getContractData()
    let currentEpoch = await contract.currentEpoch();
    console.log(await contract.roots(currentEpoch));
}

export function getContractData() : ContractData {
    const infuraProvider = new ethers.providers.InfuraProvider("rinkeby", INFURA_PROJECT_ID);
    const signer = new ethers.Wallet(RINKEBY_PRIVATE_KEY, infuraProvider);
    const rmt = new ethers.Contract(RINKEBY_CONTRACT_ADDRESS, contractAbi.abi, signer);

    return {
        contract: rmt,
        signer
    }

}