import { uploadToIPFS } from "../api/ipfs";
import { deployMerkleRoot } from "../merkle/deploy";
import { computeAllProofs } from "../merkle/generate"

(async () : Promise<void> => {
    let merkleRoot = await computeAllProofs();
    let cid = await uploadToIPFS();
    await deployMerkleRoot(merkleRoot, cid);
})();