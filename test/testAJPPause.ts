import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("Pause AJP", () => {
    it("Can adminMint even it's pausing", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setMintLimit(10)

        expect(await instance.paused()).is.false
        await instance.adminMint(1)

        await instance.pause()
        expect(await instance.paused()).is.true
        await instance.adminMint(1)
    })

    it("Toggle pausing", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        expect(await instance.paused()).is.false

        await instance.pause()
        expect(await instance.paused()).is.true
        await expect(instance.pause()).to.revertedWith("Pausable: paused")

        await instance.unpause()
        expect(await instance.paused()).is.false
        await expect(instance.unpause()).to.revertedWith("Pausable: not paused")

        await instance.pause()
    })

    it("Only admin can pause", async () => {
        const [, john] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        expect(await instance.paused()).is.false

        await expect(instance.connect(john).pause()).is.revertedWith("Ownable: caller is not the owner")
    })
})