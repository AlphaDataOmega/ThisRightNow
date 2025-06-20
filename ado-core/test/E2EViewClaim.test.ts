import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

type Claim = { address: string; amount: bigint };

function buildMerkleTree(claims: Claim[]) {
  const leaves = claims.map(c =>
    ethers.solidityPackedKeccak256(["address", "uint256"], [c.address, c.amount])
  );
  const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
  const proofs: Record<string, string[]> = {};
  for (const c of claims) {
    const leaf = ethers.solidityPackedKeccak256(["address", "uint256"], [c.address, c.amount]);
    proofs[c.address.toLowerCase()] = tree.getHexProof(leaf);
  }
  return { root: tree.getHexRoot(), proofs };
}

describe("E2E TRN View Claim", function () {
  let oracle: any;
  let distributor: any;
  let vault: any;
  let viewer1: any, viewer2: any, viewer3: any;
  let claims: Claim[];
  let proofs: Record<string, string[]>;
  let totalAmount: bigint;
  let root: string;

  beforeEach(async () => {
    [, viewer1, viewer2, viewer3] = await ethers.getSigners();

    const Oracle = await ethers.getContractFactory("TRNUsageOracle");
    oracle = await Oracle.deploy();

    const Vault = await ethers.getContractFactory("MockVault");
    vault = await Vault.deploy(oracle.target);

    claims = [
      { address: viewer1.address, amount: parseEther("10") },
      { address: viewer2.address, amount: parseEther("15") },
      { address: viewer3.address, amount: parseEther("20") },
    ];

    ({ root, proofs } = buildMerkleTree(claims));

    const Distributor = await ethers.getContractFactory("MerkleDropDistributor");
    distributor = await Distributor.deploy(oracle.target, vault.target, root);

    totalAmount = claims.reduce((a, c) => a + c.amount, 0n);
    await vault.setBalance(totalAmount);
    await vault.fundDistributor(distributor.target, totalAmount);
  });

  it("should allow users to claim TRN via Merkle proof and notify Oracle", async () => {
    for (const claim of claims) {
      const viewer = [viewer1, viewer2, viewer3].find(v => v.address === claim.address)!;
      const proof = proofs[claim.address.toLowerCase()];
      await distributor.connect(viewer).claim(claim.address, claim.amount, proof);
      const earned = await oracle.earnedTRN(claim.address);
      expect(earned).to.equal(claim.amount);
    }

    const remaining = await vault.getBalance();
    expect(remaining).to.equal(0);
  });
});
