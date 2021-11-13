import { ethers } from "hardhat";

async function main() {
  const MembershipsFactory = await ethers.getContractFactory("Memberships");
  const memberships = await MembershipsFactory.deploy(
    "Token",
    "TKN",
    "R Group"
  );
  await memberships.deployed();
  console.log(`🚀 Memberships has been deployed to: ${memberships.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
