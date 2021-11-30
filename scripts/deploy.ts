import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { keccak256 } from "@ethersproject/keccak256";
import { MembershipsFactory__factory } from "../typechain";
import { Deployment } from "./types";

async function main() {
  const accounts = await ethers.getSigners();
  const deployments: { [byteHash: string]: Deployment } = JSON.parse(
    readFileSync(`${__dirname}/../deployments/${network.name}.json`, "utf8")
  );
  const mFactory = new MembershipsFactory__factory(accounts[0]);
  const byteHash = keccak256(MembershipsFactory__factory.bytecode);
  const membershipsFactory = await mFactory.deploy();
  await membershipsFactory.deployed();
  const membershipsAddr = await membershipsFactory.memberships();
  deployments[byteHash] = {
    factory: membershipsFactory.address,
    memberships: membershipsAddr,
  };
  writeFileSync(
    `${__dirname}/../deployments/${network.name}.json`,
    JSON.stringify(deployments)
  );
  console.log(
    `🚀 MembershipsFactory has been deployed to: ${membershipsFactory.address}`
  );
  console.log(`🚀 Memberships has been deployed to: ${membershipsAddr}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
