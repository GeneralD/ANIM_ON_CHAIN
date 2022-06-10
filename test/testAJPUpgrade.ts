import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'

describe("Upgrade AJP", () => {
    it("Upgrade then field values are stored", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP)

        await instance.setBaseURI("https://test.com/")
        await instance.setMintLimit(300)
        await instance.pause()

        const AJPTest1 = await ethers.getContractFactory("AJPTest1")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest1)

        expect(await upgraded.baseURI()).to.equal("https://test.com/")
        expect(await upgraded.mintLimit()).to.equal(300)
        expect(await upgraded.paused()).to.equal(true)
    })

    it("Upgrade then new field is not set", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP)

        const AJPTest2 = await ethers.getContractFactory("AJPTest2")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest2)

        // initializer of AJPTest2 is not run
        expect(await upgraded.newField()).to.equals(0)
    })
})
