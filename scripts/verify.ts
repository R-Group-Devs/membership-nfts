import hre from "hardhat";
import { readFileSync } from "fs";
import { keccak256 } from "@ethersproject/keccak256";
import { MembershipsFactory__factory } from "../typechain";
import { Deployment } from "./types";

async function main() {
  const deployments = JSON.parse(
    readFileSync(`${__dirname}/../deployments/${hre.network.name}.json`, "utf8")
  );
  const byteHash = keccak256(MembershipsFactory__factory.bytecode);
  const address: Deployment = deployments[byteHash];
  console.log(address);
  await hre.run("verify:verify", {
    address,
    constructorArguments: [],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
