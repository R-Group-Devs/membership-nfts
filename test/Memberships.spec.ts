import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Memberships, Memberships__factory } from "../typechain";
import {
  tokenName,
  tokenSymbol,
  organization,
  mintAndCheck,
  batchMintAndCheck,
  burnAndCheck,
  batchBurnAndCheck,
} from "./utils";

const { AddressZero } = ethers.constants;

describe("Memberships", () => {
  let accounts: SignerWithAddress[];
  let memberships: Memberships;
  let wrongOwnerM: Memberships;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const mFactory = new Memberships__factory(accounts[0]);
    memberships = await mFactory.deploy(
      tokenName,
      tokenSymbol,
      organization,
      await accounts[0].getAddress()
    );
    wrongOwnerM = memberships.connect(await accounts[1].getAddress());
  });

  describe("mint", () => {
    it("owner can mint", async () => {
      await mintAndCheck(
        "Charlie",
        await accounts[2].getAddress(),
        memberships
      );
    });

    it("can't mint to 0 address", async () => {
      await expect(memberships.mint(AddressZero, "Charlie")).to.be.revertedWith(
        "ERC721: mint to the zero address"
      );
    });

    it("doesn't let non-owner mint", async () => {
      await expect(
        wrongOwnerM.mint(await accounts[2].getAddress(), "Charlie")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("batch mint", () => {
    it("owner can batch mint", async () => {
      const addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      await batchMintAndCheck(
        ["Bob", "Charlie", "Diana"],
        addresses,
        memberships
      );
    });

    it("can't batch mint to 0 address", async () => {
      const addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        AddressZero,
      ];
      await expect(
        memberships.batchMint(addresses, ["Bob", "Charlie", "Diana"])
      ).to.be.revertedWith("ERC721: mint to the zero address");
    });

    it("can't batch mint w/ mismatched array lengths", async () => {
      let addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
      ];
      await expect(
        memberships.batchMint(addresses, ["Bob", "Charlie", "Diana"])
      ).to.be.revertedWith("Memberships: Array length mismatch");

      addresses = [...addresses, await accounts[3].getAddress()];
      await expect(
        memberships.batchMint(addresses, ["Bob", "Charlie"])
      ).to.be.revertedWith("Memberships: Array length mismatch");
    });

    it("doesn't let non-owner batch mint", async () => {
      const addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      await expect(
        wrongOwnerM.batchMint(addresses, ["Bob", "Charlie", "Diana"])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("burn", () => {
    it("owner can burn", async () => {
      await burnAndCheck(
        "Charlie",
        await accounts[2].getAddress(),
        memberships
      );
    });

    it("can't burn non-existent token", async () => {
      await expect(memberships.burn(BigNumber.from("1"))).to.be.revertedWith(
        "Memberships: Non-existent token"
      );
    });

    it("doesn't let non-owner burn", async () => {
      await mintAndCheck(
        "Charlie",
        await accounts[2].getAddress(),
        memberships
      );
      await expect(
        wrongOwnerM.burn(await memberships.lastId())
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("batch burn", () => {
    it("owner can burn", async () => {
      const addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      await batchBurnAndCheck(
        ["Bob", "Charlie", "Diana"],
        addresses,
        memberships
      );
    });

    it("can't burn non-existent token", async () => {
      await expect(
        memberships.batchBurn([BigNumber.from("1"), BigNumber.from("2")])
      ).to.be.revertedWith("Memberships: Non-existent token");
    });

    it("doesn't let non-owner burn", async () => {
      const addresses = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      await batchMintAndCheck(
        ["Bob", "Charlie", "Diana"],
        addresses,
        memberships
      );
      const lastTokenId = await memberships.lastId();
      const tokenIds: BigNumber[] = [];
      for (let i = 0; i < addresses.length; i++) {
        tokenIds.push(lastTokenId.sub(i));
      }
      await expect(wrongOwnerM.batchBurn(tokenIds)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("approve / transfer", () => {
    it("doesn't allow approval of tokens for transfer", async () => {
      await mintAndCheck("Alice", await accounts[0].getAddress(), memberships);
      await expect(
        memberships.approve(
          await accounts[1].getAddress(),
          await memberships.lastId()
        )
      ).to.be.revertedWith("Memberships: cannot be approved for transfer");
    });

    it("doesn't allow transferFrom", async () => {
      const aliceAddr = await accounts[0].getAddress();
      await mintAndCheck("Alice", aliceAddr, memberships);
      const tokenId = await memberships.lastId();

      await expect(
        memberships.transferFrom(
          aliceAddr,
          await accounts[1].getAddress(),
          tokenId
        )
      ).to.be.revertedWith("Memberships: cannot be transferred");
    });
  });
});
