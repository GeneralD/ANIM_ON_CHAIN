import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("Mint AJP as admin", () => {
  it("Owner can mint in the limit", async () => {
    const [deployer] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)

    await expect(instance.adminMint(1000))
      // can check only an event per an 'expect' expression, but 1000 events were emitted
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", deployer.address, 1000)

    expect(await instance.totalSupply()).to.equal(1000)
  })

  it("Even admin can't mint over the limit", async () => {
    const [deployer, john] = await ethers.getSigners()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)

    await expect(instance.adminMint(1000))
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", deployer.address, 1000)

    expect(await instance.totalSupply()).to.equal(1000)

    await expect(instance.adminMint(1005)).to.be.reverted

    await expect(instance.adminMintTo(john.address, 1000))
      .to.emit(instance, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", john.address, 2000)

    expect(await instance.totalSupply()).to.equal(2000)
    expect(await instance.ownerOf(1001)).to.equal(john.address)
    expect(await instance.ownerOf(2000)).to.equal(john.address)
  })
})
