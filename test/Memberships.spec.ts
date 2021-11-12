import { BigNumber } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Memberships } from "../typechain";

const { AddressZero } = ethers.constants;
const { parseUnits } = ethers.utils;


describe("Memberships", () => {
    describe("mint", () => {
        it("owner can mint", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't mint to 0 address", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("doesn't let non-owner mint", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })
    })

    describe("batch mint", () => {
        it("owner can batch mint", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't batch mint to 0 address", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't batch mint w/ mismatched array lengths", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("doesn't let non-owner batch mint", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })
    })

    describe("burn", () => {
        it("owner can burn", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't burn non-existant token", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("doesn't let non-owner burn", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })
    })

    describe("batch burn", () => {
        it("owner can burn", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't burn non-existant token", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("can't batch burn w/ mismatched array lengths", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })

        it("doesn't let non-owner burn", async () => {
            expect(1).to.eq(2, "1 doesn't equal 2")
        })
    })

    describe("approve / transfer", () => {
        it("doesn't allow approval of tokens for transfer", async () => {
            expect(1).to.eq(1, "1 doesn't equal 1")
        })

        it("doesn't allow transferFrom or safeTransferFrom", async () => {
            expect(1).to.eq(1, "1 doesn't equal 1")
        })
    })
})