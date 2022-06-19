import { expect, use } from 'chai'
import chaiString from 'chai-string'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

use(chaiString)

describe("AJP URI", () => {
    it("Default baseURI ends with a slash", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        expect(await instance.baseURI()).to.endWith("/")
    })

    it("Check tokenURI for tokenId", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setBaseURI("https://test.com/")

        await instance.setMintLimit(10)
        await instance.adminMint(10)

        expect(await instance.tokenURI(8)).to.equal("https://test.com/8.json")
    })

    it("Reading tokenURI should be reverted for tokenId which is not minted yet", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await expect(instance.tokenURI(8)).to.reverted
    })

    it("Reading tokenURI should be reverted for tokenId which is already burned", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setMintLimit(10)
        await instance.adminMint(10)
        await instance.burn(6)

        await expect(instance.tokenURI(6)).to.reverted
    })

    it("Check contractURI", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setBaseURI("https://test.com/")
        expect(await instance.contractURI()).to.equal("https://test.com/index.json")
    })
})
