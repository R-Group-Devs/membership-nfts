import { ethers, network } from "hardhat";
import { readFileSync, writeFileSync } from "fs";
import { keccak256 } from "@ethersproject/keccak256";
import { Memberships__factory } from "../typechain";
import args from "./membershipsArgs.json";
import { Deployment } from "./types";

async function main() {
  const accounts = await ethers.getSigners();
  const deployments = JSON.parse(
    readFileSync(`${__dirname}/../deployments/${network.name}.json`, "utf8")
  );
  const mFactory = new Memberships__factory(accounts[0]);
  const byteHash = keccak256(Memberships__factory.bytecode);
  let owner = args.owner;
  if (owner === "") owner = await accounts[0].getAddress();
  const memberships = await mFactory.deploy(
    args.name,
    args.symbol,
    args.organization,
    owner
  );
  await memberships.deployed();
  const deployment: Deployment = {
    address: memberships.address,
    args: {
      name: args.name,
      symbol: args.symbol,
      organization: args.organization,
      owner,
    },
  };
  deployments[byteHash] = deployment;
  writeFileSync(
    `${__dirname}/../deployments/${network.name}.json`,
    JSON.stringify(deployments)
  );
  console.log(`🚀 Memberships has been deployed to: ${memberships.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
