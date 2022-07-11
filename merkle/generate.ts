import { BigNumber, utils } from "ethers";
import { writeFile } from "fs/promises";
import { prepareAccountScores } from "../api/positions";
import { AccountReputation, Proof, WholeTree } from "../common/types";

export const hash = (leaf: AccountReputation): string => {
    return utils.keccak256(
        utils.defaultAbiCoder.encode(
            ["uint256", "address", "uint256"],
            [BigNumber.from(leaf.index), leaf.account, BigNumber.from(leaf.experience)]
        )
    );
};

const reduceMerkleBranches = (leaves: string[]) => {
  let output: any = [];
  while (leaves.length) {
    let left = leaves.shift();
    let right = leaves.length === 0 ? left : leaves.shift();
    output.push(
      utils.keccak256(
        utils.defaultAbiCoder.encode(["bytes32", "bytes32"], [left, right])
      )
    );
  }
  return output;
};

const computeMerkleProof = (wholeTree: string[][], index: number) : string[] => {
  let hashedLeaves: string[][] = wholeTree;
  if (index == null) {
    throw new Error("address not found");
  }
  let path: number = index;
  let proof: string[] = [];
  let i = 0
  while (i < hashedLeaves.length) {
    if (path % 2 == 1) {
      proof.push(hashedLeaves[i][path - 1]);
    } else {
      if (hashedLeaves[i][path + 1]) {
        proof.push(hashedLeaves[i][path + 1]);
      } else {
        proof.push(hashedLeaves[i][path])
      }
    }

    // Move up
    path = parseInt((path / 2).toString());
    i += 1
  }
    proof.pop()

  return proof;
};

const computeRoot = (balances: AccountReputation[]) : WholeTree => {
  const leaves: AccountReputation[] = balances;
  let hashedLeaves: string[] = leaves.map(hash);
  let wholeTree: string[][] = []
  wholeTree.push(Array.from(hashedLeaves))
  while (hashedLeaves.length > 1) {
    hashedLeaves = reduceMerkleBranches(hashedLeaves);
    wholeTree.push(Array.from(hashedLeaves))
  }

  return {root: hashedLeaves[hashedLeaves.length - 1], wholeTree};
};

const computeAllProofs = async () => {
  const data: AccountReputation[] = await prepareAccountScores();
  const leaves = data
  let proofs: Proof[] = [];
  const wholeTree: WholeTree = computeRoot(data);
  leaves.forEach((leaf: AccountReputation, i: any) => {
    const proof: string[] = computeMerkleProof(wholeTree.wholeTree, leaf.index);
    proofs.push({ proof, leaf });
  });
  const merkleData = {
    root: wholeTree.root,
    proofs
  };
  await writeFile("./data/merkle.json", JSON.stringify(merkleData))
};

computeAllProofs();