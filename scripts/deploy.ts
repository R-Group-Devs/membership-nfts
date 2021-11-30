import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { keccak256 } from "@ethersproject/keccak256";
import { MembershipsFactory__factory } from "../typechain";

async function main() {
  const accounts = await ethers.getSigners();
  const deployments = JSON.parse(
    readFileSync(`${__dirname}/../deployments/${network.name}.json`, "utf8")
  );
  const mFactory = new MembershipsFactory__factory(accounts[0]);
  const byteHash = keccak256(MembershipsFactory__factory.bytecode);
  const membershipsFactory = await mFactory.deploy();
  await membershipsFactory.deployed();
  deployments[byteHash] = membershipsFactory.address;
  writeFileSync(
    `${__dirname}/../deployments/${network.name}.json`,
    JSON.stringify(deployments)
  );
  console.log(
    `🚀 MembershipsFactory has been deployed to: ${membershipsFactory.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
