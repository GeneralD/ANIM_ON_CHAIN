import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("Upgrade AJP", () => {
    it("Upgrade then field values are stored", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setBaseURI("https://test.com/")
        await instance.setMintLimit(300)
        await instance.pause()

        const AJPTest1 = await ethers.getContractFactory("AJPTest1")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest1)
        expect(upgraded.address).to.equal(instance.address, "before and after upgrade addresses should be same")

        expect(await upgraded.baseURI()).to.equal("https://test.com/", "stored values should be kept beyond upgrade")
        expect(await upgraded.mintLimit()).to.equal(300, "stored values should be kept beyond upgrade")
        expect(await upgraded.paused()).to.equal(true, "stored values should be kept beyond upgrade")
    })

    it("Upgrade then new field is not set", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        const AJPTest2 = await ethers.getContractFactory("AJPTest2")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest2)
        expect(upgraded.address).to.equal(instance.address, "before and after upgrade addresses should be same")

        // initializer of AJPTest2 is not run
        expect(await upgraded.newField()).to.equals(0)
    })

    it("Upgrade and run migrate funciton", async () => {
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        const AJPTest2 = await ethers.getContractFactory("AJPTest2")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest2, { call: { fn: "migrate", args: [777] } })
        expect(upgraded.address).to.equal(instance.address, "before and after upgrade addresses should be same")

        // initializer of AJPTest2 is not run
        expect(await upgraded.newField()).to.equals(777)
    })


    it("Upgrade via beacon then field values are stored", async () => {
        // deploy beacon
        const AJP = await ethers.getContractFactory("AJP")
        const beacon = await upgrades.deployBeacon(AJP)

        // deploy proxied AJP
        const instance = await upgrades.deployBeaconProxy(beacon, AJP) as AJP

        // set values
        await instance.setBaseURI("https://test.com/")
        await instance.setMintLimit(99)
        await instance.adminMint(3)

        // upgrade beacon
        const AJPTest1 = await ethers.getContractFactory("AJPTest1")
        await upgrades.upgradeBeacon(beacon.address, AJPTest1)

        // deploy proxied AJPTest1
        const upgraded = await AJPTest1.attach(instance.address)
        expect(upgraded.address).to.equal(instance.address, "before and after upgrade addresses should be same")

        // check values should be stored
        expect(await upgraded.baseURI()).to.equal("https://test.com/", "stored values should be kept beyond upgrade")
        expect(await upgraded.mintLimit()).to.equal(99, "stored values should be kept beyond upgrade")
        expect(await upgraded.totalSupply()).to.equal(3, "stored values should be kept beyond upgrade")
    })
})
