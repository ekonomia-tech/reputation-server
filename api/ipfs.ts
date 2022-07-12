import { config } from "dotenv";
import { writeFile } from "fs/promises";
import { CIDString, getFilesFromPath, Web3Storage } from "web3.storage";
config()

export async function uploadToIPFS() : Promise<string> {
    const storageToken = process.env.STORAGE_TOKEN;
    
    if(!storageToken) {
        throw "Storage token invalid/not provided"
    }

    const client = new Web3Storage({ endpoint: new URL('https://api.web3.storage'), token: storageToken });
    const files = await getFilesFromPath("./data/merkle.json");

    const cid : CIDString= await client.put(files);
    
    await writeFile("./data/ipfsPath.txt", cid)
    return cid;
}