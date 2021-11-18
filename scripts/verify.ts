import hre from "hardhat";
import { readFileSync } from "fs";
import { keccak256 } from "@ethersproject/keccak256";
import { Memberships__factory } from "../typechain";
import { Deployment } from "./types";

async function main() {
  const deployments = JSON.parse(
    readFileSync(`${__dirname}/../deployments/${hre.network.name}.json`, "utf8")
  );
  const byteHash = keccak256(Memberships__factory.bytecode);
  const deployment: Deployment = deployments[byteHash];
  console.log(deployment.address, [
    deployment.args.name,
    deployment.args.symbol,
    deployment.args.organization,
    deployment.args.owner,
  ]);
  await hre.run("verify:verify", {
    address: deployment.address,
    constructorArguments: [
      deployment.args.name,
      deployment.args.symbol,
      deployment.args.organization,
      deployment.args.owner,
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
