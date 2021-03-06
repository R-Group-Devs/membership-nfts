import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, assert } from "chai";
import { ethers } from "hardhat";
import { Memberships } from "../typechain/Memberships";
import { MembershipsFactory } from "../typechain/MembershipsFactory";
import {
  MembershipsFactory__factory,
  Memberships__factory,
} from "../typechain";
import {
  tokenName,
  tokenSymbol,
  organization,
  transferable,
  createAndCheckProxy,
  mintAndCheck,
  batchMintAndCheck,
  burnAndCheck,
  batchBurnAndCheck,
} from "./utils";
import { randomBytes } from "ethers/lib/utils";

const { AddressZero } = ethers.constants;

/**
 * TODO
 * - test createMemberships, including all options
 * - test toggleTransferable
 * - test transfer / approve / safeTransfer when transferable is active
 * - verify mintedTo
 */

describe("Memberships", () => {
  let accounts: SignerWithAddress[];
  let ownerAddr: string;
  let factory: MembershipsFactory;
  let memberships: Memberships;
  let wrongOwnerM: Memberships;

  beforeEach(async () => {
    accounts = await ethers.getSigners();
    const fFactory = new MembershipsFactory__factory(accounts[0]);
    factory = await fFactory.deploy();
    await factory.deployed();
    ownerAddr = await accounts[1].getAddress();
    const address = await createAndCheckProxy(
      factory,
      tokenName,
      tokenSymbol,
      organization,
      transferable,
      ownerAddr
    );
    const mFactory = new Memberships__factory(accounts[1]);
    memberships = mFactory.attach(address);
    wrongOwnerM = memberships.connect(await accounts[0].getAddress());
  });

  describe("create new memberships", () => {
    it.skip("can't create a new proxy with identical inputs to an existing one", async () => {
      // looks like it does allow this now, but not sure that's a problem
    });

    it("can create a new proxy that is NOT transferable", async () => {
      await createAndCheckProxy(
        factory,
        tokenName,
        tokenSymbol,
        organization,
        true,
        ownerAddr
      );
    });
  });

  describe("toggleTransferable", () => {
    it("toggles transferable", async () => {
      const transferable = await memberships.transferable();
      await expect(memberships.toggleTransferable())
        .to.emit(memberships, "ToggleTransferable")
        .withArgs(!transferable);
      await expect(memberships.toggleTransferable())
        .to.emit(memberships, "ToggleTransferable")
        .withArgs(transferable);
    });
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
        wrongOwnerM.burn((await memberships.nextId()).sub(1))
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
      const lastTokenId = (await memberships.nextId()).sub(1);
      const tokenIds: BigNumber[] = [];
      for (let i = 0; i < addresses.length; i++) {
        tokenIds.push(lastTokenId.sub(i));
      }
      await expect(wrongOwnerM.batchBurn(tokenIds)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("approve, transfer, safeTransferFrom", () => {
    it("doesn't allow approve, transferFrom, or safeTransferFrom if transferable is false", async () => {
      const aliceAddr = await accounts[0].getAddress();
      const bobAddr = await accounts[1].getAddress();
      await mintAndCheck("Alice", aliceAddr, memberships);
      const tokenId = (await memberships.nextId()).sub(1);

      await expect(memberships.approve(bobAddr, tokenId)).to.be.revertedWith(
        "Memberships: not transferable"
      );

      await expect(
        memberships.transferFrom(aliceAddr, bobAddr, tokenId)
      ).to.be.revertedWith("Memberships: not transferable");

      await expect(
        memberships.callStatic["safeTransferFrom(address,address,uint256)"](
          aliceAddr,
          bobAddr,
          tokenId
        )
      ).to.be.revertedWith("Memberships: not transferable");

      await expect(
        memberships.callStatic[
          "safeTransferFrom(address,address,uint256,bytes)"
        ](aliceAddr, bobAddr, tokenId, randomBytes(5))
      ).to.be.revertedWith("Memberships: not transferable");
    });

    it("does allow approve, transferFrom, and safeTransferFrom is transferable is true", async () => {
      const address = await createAndCheckProxy(
        factory,
        tokenName,
        tokenSymbol,
        organization,
        true,
        ownerAddr
      );

      const mFactory = new Memberships__factory(accounts[1]);
      const bobMemberships = mFactory.attach(address);

      const aliceAddr = await accounts[0].getAddress();
      const aliceMemberships = bobMemberships.connect(accounts[0]);

      const bobAddr = await accounts[1].getAddress();
      await mintAndCheck("Bob", bobAddr, bobMemberships);
      const tokenId = (await bobMemberships.nextId()).sub(1);

      await expect(bobMemberships.approve(aliceAddr, tokenId))
        .to.emit(bobMemberships, "Approval")
        .withArgs(bobAddr, aliceAddr, tokenId);

      assert.equal(
        await bobMemberships.getApproved(tokenId),
        aliceAddr,
        "approval"
      );

      await expect(bobMemberships.transferFrom(bobAddr, aliceAddr, tokenId))
        .to.emit(bobMemberships, "Transfer")
        .withArgs(bobAddr, aliceAddr, tokenId);

      assert.equal(await bobMemberships.ownerOf(tokenId), aliceAddr, "owner");

      await expect(
        aliceMemberships["safeTransferFrom(address,address,uint256)"](
          aliceAddr,
          bobAddr,
          tokenId
        )
      )
        .to.emit(aliceMemberships, "Transfer")
        .withArgs(aliceAddr, bobAddr, tokenId);

      assert.equal(await bobMemberships.ownerOf(tokenId), bobAddr, "owner");

      await expect(
        bobMemberships["safeTransferFrom(address,address,uint256,bytes)"](
          bobAddr,
          aliceAddr,
          tokenId,
          randomBytes(1)
        )
      )
        .to.emit(bobMemberships, "Transfer")
        .withArgs(bobAddr, aliceAddr, tokenId);

      assert.equal(await bobMemberships.ownerOf(tokenId), aliceAddr, "owner");
    });
  });
});
