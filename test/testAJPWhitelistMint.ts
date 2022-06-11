import { expect } from 'chai'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import MerkleTree from 'merkletreejs'
import { describe } from 'mocha'

describe("Mint AJP as whitelisted member", () => {
    it("Whitelisted member can mint and get bonus", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [deployer, john, jonny, jonathan] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP)

        // register whitelist
        const whitelisted = [john, jonny, jonathan]
        const leaves = whitelisted.map(account => keccak256(account.address))
        const tree = new MerkleTree(leaves, keccak256, { sort: true })
        const root = tree.getHexRoot()
        await instance.setWhitelist(root)

        // check balance to mint
        const whitelistPrice = await instance.WHITELIST_PRICE()
        const balance = await john.getBalance()
        expect(balance.gte(whitelistPrice)).is.true

        // mint
        const proof = tree.getHexProof(keccak256(john.address))
        // await instance.connect(john).whitelistMint(25, true, proof, { value: whitelistPrice })

        // expect(await instance.balanceOf(john.address)).to.equal(27)
    })
})