import { ethers } from "hardhat";
import {
  Memberships,
  Memberships__factory,
  NFTDescriptor__factory,
} from "../typechain";

async function main() {
  const accounts = await ethers.getSigners();
  const nFactory = new NFTDescriptor__factory(accounts[0]);
  const nftDescriptor = await nFactory.deploy();
  const mFactory = new Memberships__factory(
    { "contracts/NFTDescriptor.sol:NFTDescriptor": nftDescriptor.address },
    accounts[0]
  );
  const memberships = await mFactory.deploy(
    "OG",
    "MSHP",
    "R Group",
    await accounts[0].getAddress()
  );
  await memberships.deployed();
  console.log(`🚀 Memberships has been deployed to: ${memberships.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
