import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import MerkleTree from 'merkletreejs'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("Pause AJP", () => {
    it("Toggle whitelist mint pausing", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        // unpause if it's paused
        if (await instance.isWhitelistMintPaused())
            await instance.unpauseWhitelistMint()

        await expect(instance.pauseWhitelistMint())
            .to.emit(instance, "WhitelistMintPaused")

        expect(await instance.isWhitelistMintPaused()).is.true

        await expect(instance.pauseWhitelistMint())
            .to.revertedWith("whitelist mint: paused")

        await expect(instance.unpauseWhitelistMint())
            .to.emit(instance, "WhitelistMintUnpaused")

        expect(await instance.isWhitelistMintPaused()).is.false

        await expect(instance.unpauseWhitelistMint())
            .to.revertedWith("whitelist mint: not paused")
    })


    it("Toggle public mint pausing", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        // unpause if it's paused
        if (await instance.isPublicMintPaused())
            await instance.unpausePublicMint()

        await expect(instance.pausePublicMint())
            .to.emit(instance, "PublicMintPaused")

        expect(await instance.isPublicMintPaused()).is.true

        await expect(instance.pausePublicMint())
            .to.revertedWith("public mint: paused")

        await expect(instance.unpausePublicMint())
            .to.emit(instance, "PublicMintUnpaused")

        expect(await instance.isPublicMintPaused()).is.false

        await expect(instance.unpausePublicMint())
            .to.revertedWith("public mint: not paused")
    })


    it("Toggle chief mint pausing", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        // unpause if it's paused
        if (await instance.isChiefMintPaused())
            await instance.unpauseChiefMint()

        await expect(instance.pauseChiefMint())
            .to.emit(instance, "ChiefMintPaused")

        expect(await instance.isChiefMintPaused()).is.true

        await expect(instance.pauseChiefMint())
            .to.revertedWith("chief mint: paused")

        await expect(instance.unpauseChiefMint())
            .to.emit(instance, "ChiefMintUnpaused")

        expect(await instance.isChiefMintPaused()).is.false

        await expect(instance.unpauseChiefMint())
            .to.revertedWith("chief mint: not paused")
    })

    it("Only admin can pause", async () => {
        const [, john] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await expect(instance.connect(john).pauseChiefMint()).to.revertedWith("Ownable: caller is not the owner")
        await expect(instance.connect(john).pausePublicMint()).to.revertedWith("Ownable: caller is not the owner")
        await expect(instance.connect(john).pauseWhitelistMint()).to.revertedWith("Ownable: caller is not the owner")
    })

    it("Whitelist mint is not available if it's paused", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const [, john, jonny, jonathan] = await ethers.getSigners()

        const instance = await upgrades.deployProxy(AJP) as AJP
        if (!(await instance.isWhitelistMintPaused())) await instance.pauseWhitelistMint()

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

        const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
        await expect(instance.connect(jonathan).whitelistMint(quantity, false, proofOfJonathan, { value: totalPrice })).to.revertedWith("whitelist mint: paused")
    })
})