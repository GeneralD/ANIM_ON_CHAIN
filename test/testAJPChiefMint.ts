import { expect } from 'chai'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { MerkleTree } from 'merkletreejs'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("AJP Chief Mint", () => {
    it("Chief member is verified", async () => {
        // list of important guys
        const chiefAddresses = [
            process.env.CEO_ADDRESS,
            process.env.CTO_ADDRESS,
            process.env.CFO_ADDRESS,
            process.env.CMO_ADDRESS,
        ].filter((elm?: string): elm is string => elm !== undefined && elm.startsWith("0x"))

        // register merkle root of the guys
        const leaves = chiefAddresses.map(keccak256)
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        await instance.setChiefList(root)

        expect(process.env.CTO_ADDRESS).is.match(/^0x[0-9a-fA-F]{40}/)

        // CTO is a chief
        const proof = tree.getHexProof(keccak256(process.env.CTO_ADDRESS!))
        expect(await instance.connect(process.env.CTO_ADDRESS!).areYouChief(proof)).is.true
    })

    it("Chief member can mint", async () => {
        const [, john, jonny, jonathan, , , someone] = await ethers.getSigners()
        const chiefs = [john, jonny, jonathan]

        // use signer addresses instead of actual chiefs for testing
        const leaves = chiefs.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        await instance.setChiefList(root)

        // try to mint
        const proof = tree.getHexProof(keccak256(jonny.address))
        await expect(instance.connect(jonny).chiefMint(10, proof))
            .to.emit(instance, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", jonny.address, 10)

        await expect(instance.connect(jonny).chiefMintTo(someone.address, 10, proof))
            .to.emit(instance, "Transfer")
            .withArgs("0x0000000000000000000000000000000000000000", someone.address, 20)
    })

    it("Not Chief member can't mint", async () => {
        // list of important guys
        const chiefAddresses = [
            process.env.CEO_ADDRESS,
            process.env.CTO_ADDRESS,
            process.env.CFO_ADDRESS,
            process.env.CMO_ADDRESS,
        ].filter((elm?: string): elm is string => elm !== undefined && elm.startsWith("0x"))

        // register merkle root of the guys
        const leaves = chiefAddresses.map(keccak256)
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        await instance.setChiefList(root)

        const [, , , , , , , stranger] = await ethers.getSigners()

        // stranger is not a chief
        const proof = tree.getHexProof(keccak256(stranger.address))
        expect(await instance.connect(stranger).areYouChief(proof)).is.false

        // try to mint
        await expect(instance.connect(stranger).chiefMint(10, proof)).to.revertedWith("invalid merkle proof")
    })
})
