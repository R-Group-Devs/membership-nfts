import { BigNumber } from "@ethersproject/bignumber";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Memberships } from "../typechain";

export const tokenName = "Token";
export const tokenSymbol = "TKN";
export const organization = "R Group";
const URI = "placeholder";

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
}

export async function mintAndCheck(
  nickName: string,
  to: string,
  memberships: Memberships
) {
  const lastTokenId = await memberships.lastId();
  const balance1 = await memberships.balanceOf(to);
  // check mint and Transfer event
  await expect(memberships.mint(to, nickName))
    .to.emit(memberships, "Transfer")
    .withArgs(ethers.constants.AddressZero, to, lastTokenId.add(1));
  await checkMint(balance1, to, nickName, memberships, lastTokenId.add(1));
}

export async function batchMintAndCheck(
  nickNames: string[],
  tos: string[],
  memberships: Memberships
) {
  const lastTokenId = await memberships.lastId();
  const firstTokenId = lastTokenId.add(1);
  const balances1: BigNumber[] = [];
  for (let i = 0; i < nickNames.length; i++) {
    balances1[i] = await memberships.balanceOf(tos[i]);
  }
  await memberships.batchMint(tos, nickNames);
  for (let i = 0; i < nickNames.length; i++) {
    await checkMint(
      balances1[i],
      tos[i],
      nickNames[i],
      memberships,
      firstTokenId.add(i)
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
  const tokenId = await memberships.lastId();
  await expect(memberships.burn(tokenId))
    .to.emit(memberships, "Transfer")
    .withArgs(address, ethers.constants.AddressZero, tokenId);
  await checkBurn(tokenId, memberships);
}

export async function batchBurnAndCheck(
  nickNames: string[],
  tos: string[],
  memberships: Memberships
) {
  await batchMintAndCheck(nickNames, tos, memberships);
  const lastTokenId = await memberships.lastId();
  const tokenIds: BigNumber[] = [];
  for (let i = 0; i < tos.length; i++) {
    tokenIds.push(lastTokenId.sub(i));
  }
  await memberships.batchBurn(tokenIds);
  for (let i = 0; i < tos.length; i++) {
    await checkBurn(tokenIds[i], memberships);
  }
}
