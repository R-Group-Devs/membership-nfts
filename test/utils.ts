import { BigNumber } from "@ethersproject/bignumber";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Memberships } from "../typechain/Memberships";

export const tokenName = "Token";
export const tokenSymbol = "TKN";
export const organization = "R Group";
export const transferable = false;

async function checkMint(
  balance1: BigNumber,
  to: string,
  nickName: string,
  memberships: Memberships,
  tokenId: BigNumber
) {
  // check that to now holds the token
  const balance2 = await memberships.balanceOf(to);
  assert.deepEqual(balance1, balance2.sub(1), `balance`);
  // check the token has the expected values
  const tokenData = await memberships.tokenDataOf(tokenId);
  assert.deepEqual(tokenData.id, tokenId, `token id`);
  assert.equal(tokenData.owner, to, `to`);
  assert.equal(tokenData.nickName, nickName, `nickName`);
  assert.equal(tokenData.organization, organization, `organization`);
  assert.equal(tokenData.tokenName, tokenName, `token name`);
  // TODO check the URI
  const tokenURI = await memberships.tokenURI(tokenId);
  const [, jsonBase64] = tokenURI.split(",");
  const json = Buffer.from(jsonBase64, "base64").toString();
  const [, imageBase64] = JSON.parse(json).image.split(",");
  const svg = Buffer.from(imageBase64, "base64").toString();
  assert.equal(typeof svg, "string", `svg`);
}

export async function mintAndCheck(
  nickName: string,
  to: string,
  memberships: Memberships
) {
  const nextTokenId = await memberships.nextId();
  const balance1 = await memberships.balanceOf(to);
  // check mint and Transfer event
  await expect(memberships.mint(to, nickName))
    .to.emit(memberships, "Transfer")
    .withArgs(ethers.constants.AddressZero, to, nextTokenId);
  await checkMint(balance1, to, nickName, memberships, nextTokenId);
}

export async function batchMintAndCheck(
  nickNames: string[],
  tos: string[],
  memberships: Memberships
) {
  const nextTokenId = await memberships.nextId();
  const balances1: BigNumber[] = [];
  for (let i = 0; i < nickNames.length; i++) {
    balances1[i] = await memberships.balanceOf(tos[i]);
  }
  const tx = await memberships.batchMint(tos, nickNames);
  await tx.wait();
  for (let i = 0; i < nickNames.length; i++) {
    await checkMint(
      balances1[i],
      tos[i],
      nickNames[i],
      memberships,
      nextTokenId.add(i)
    );
  }
}

async function checkBurn(tokenId: BigNumber, memberships: Memberships) {
  await expect(memberships.tokenDataOf(tokenId)).to.be.revertedWith(
    "ERC721: owner query for nonexistent token"
  );
  await expect(memberships.tokenURI(tokenId)).to.be.revertedWith(
    "Memberships: non-existent token"
  );
}

export async function burnAndCheck(
  nickName: string,
  address: string,
  memberships: Memberships
) {
  await mintAndCheck(nickName, address, memberships);
  const tokenId = await memberships.nextId();
  await expect(memberships.burn(tokenId.sub(1)))
    .to.emit(memberships, "Transfer")
    .withArgs(address, ethers.constants.AddressZero, tokenId.sub(1));
  await checkBurn(tokenId, memberships);
}

export async function batchBurnAndCheck(
  nickNames: string[],
  tos: string[],
  memberships: Memberships
) {
  await batchMintAndCheck(nickNames, tos, memberships);
  const nextTokenId = await memberships.nextId();
  const tokenIds: BigNumber[] = [];
  for (let i = 0; i < tos.length; i++) {
    tokenIds.push(nextTokenId.sub(i + 1));
  }
  await memberships.batchBurn(tokenIds);
  for (let i = 0; i < tos.length; i++) {
    await checkBurn(tokenIds[i], memberships);
  }
}
