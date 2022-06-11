import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { keccak256, parseEther } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import MerkleTree from 'merkletreejs'
import { describe } from 'mocha'

describe("Mint AJP as whitelisted member", () => {
    it("Whitelisted member can mint and get bonus", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [, john, jonny, jonathan] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP)

        // register whitelist
        const whitelisted = [john, jonny, jonathan]
        const leaves = whitelisted.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        await instance.setWhitelist(root)

        // check balance to mint
        const price = await instance.WHITELIST_PRICE()
        const quantity = await instance.WHITELISTED_OWNER_MINT_LIMIT()
        const totalPrice = price.mul(quantity)
        const balance = await john.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // mint
        const proof = tree.getHexProof(keccak256(john.address))
        await instance.connect(john).whitelistMint(quantity, true, proof, { value: totalPrice })

        // greater than (or equals), because there may be some bonus
        expect((await instance.connect(john).balance()).gte(quantity)).is.true
    })

    it("Not whitelisted member's minting is not allowed", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [, john, jonny, jonathan, mike] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP)

        // register whitelist
        const whitelisted = [john, jonny, jonathan]
        const leaves = whitelisted.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        await instance.setWhitelist(root)

        // try to mint
        const proof = tree.getHexProof(keccak256(mike.address))
        const enoughBadget = parseEther("1000")
        await expect(instance.connect(mike).whitelistMint(5, true, proof, { value: enoughBadget })).to.revertedWith("invalid merkle proof")
    })

    it("Whitelisted member can mint but not over the limit", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [, john, jonny, jonathan] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP)

        // register whitelist
        const whitelisted = [john, jonny, jonathan]
        const leaves = whitelisted.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        await instance.setWhitelist(root)

        // check balance to mint
        const price: BigNumber = await instance.WHITELIST_PRICE()
        const quantity: BigNumber = await instance.WHITELISTED_OWNER_MINT_LIMIT()
        const totalPrice = price.mul(quantity)
        const balance = await jonathan.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // mint without bonus
        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await instance.connect(jonathan).whitelistMint(quantity, false, proofOfJonathan, { value: totalPrice })

        // try to mint more and fail
        await expect(instance.connect(jonathan).whitelistMint(quantity, false, proofOfJonathan, { value: totalPrice })).to.revertedWith("WL minting exceeds the limit")

        // but other guy is still ok
        const proofOfJonny = tree.getHexProof(keccak256(jonny.address))
        await instance.connect(jonny).whitelistMint(quantity, true, proofOfJonny, { value: totalPrice })
    })

    it("Whitelisted member can mint in whitelist mint limit but not over the limit of entire contract", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [, john, jonny, jonathan] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP)

        await instance.setMintLimit(10)

        // register whitelist
        const whitelisted = [john, jonny, jonathan]
        const leaves = whitelisted.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        await instance.setWhitelist(root)

        // check balance to mint
        const price: BigNumber = await instance.WHITELIST_PRICE()
        const quantity: BigNumber = await instance.WHITELISTED_OWNER_MINT_LIMIT()
        const totalPrice = price.mul(quantity)
        const balance = await jonathan.getBalance()
        expect(balance.gte(totalPrice)).is.true

        // mint without bonus
        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await expect(instance.connect(jonathan).whitelistMint(quantity, false, proofOfJonathan, { value: totalPrice })).to.revertedWith("minting exceeds the limit")
    })
})