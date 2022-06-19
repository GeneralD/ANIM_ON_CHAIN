import { expect } from 'chai'
import { parseEther } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("AJP Royalty (EIP2981)", () => {
    it("Check royalty fee", async () => {
        const [deployer] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setMintLimit(10)
        await instance.adminMint(10)
        await instance.setRoyaltyFraction(750) // fee=7.5%

        const info = await instance.royaltyInfo(5, parseEther("0.1"))
        expect(info.receiver).to.equal(deployer.address)
        expect(info.royaltyAmount).to.equal(parseEther("0.0075"))
    })

    it("Reading royalty info should be reverted when the tokenId is not minted yet", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await expect(instance.royaltyInfo(100, parseEther("1"))).to.reverted
    })


    it("Reading royalty info should be reverted when the tokenId is already burnt", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setMintLimit(10)
        await instance.adminMint(10)

        // check it's ok now
        await instance.royaltyInfo(8, parseEther("0.1"))
        // burn and then check it again
        await instance.burn(8)
        await expect(instance.royaltyInfo(8, parseEther("0.1"))).to.reverted
    })
})