import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Memberships } from "../typechain";

const { AddressZero } = ethers.constants;
const { parseUnits } = ethers.utils;

/**
 * Tests should check that:
 * - owner can mint
 * - can't mint to 0 address
 * - non-owner can't mint
 * 
 * - owner can batch mint
 * - can't batch mint to 0 address
 * - can't batch mint with mismatched array lengths
 * - non-owner can't batch mint
 * 
 * - owner can burn
 * - can't burn non-existant token
 * - non-owner can't burn
 * 
 * - owner can batch burn
 * - can't burn non-existant tokens
 * - non-owner can't batch burn
 * 
 * - no one can transfer
 * - no one can approve tokens for transfer
 */

describe("tests", () => {
    it("runs tests", async () => {
        expect(1).to.eq(1, "1 doesn't equal 1")
    })
})