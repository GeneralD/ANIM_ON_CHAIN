import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'

describe("AJP", () => {

  it("Owner can mint in the limit", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(2000)

    await instance.adminMint(1000)
    expect(await instance.totalSupply()).to.equal(1000)
  })

  it("Even admin can't mint over the limit", async () => {
    const [, john] = await ethers.getSigners()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(2000)

    await instance.adminMint(1000)
    expect(await instance.totalSupply()).to.equal(1000)

    await expect(instance.adminMint(1005)).to.be.reverted

    await instance.adminMintTo(john.address, 1000)

    expect(await instance.totalSupply()).to.equal(2000)
    expect(await instance.ownerOf(1001)).to.equal(john.address)
    expect(await instance.ownerOf(2000)).to.equal(john.address)
  })

  it("Owner can burn then totalSupply decreased", async () => {
    const [deployer] = await ethers.getSigners()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(10)
    await instance.adminMint(5)

    expect(await instance.totalSupply()).to.equal(5)
    expect(await instance.ownerOf(3)).to.equal(deployer.address)

    await instance.burn(1)
    await instance.burn(2)
    await instance.burn(3)

    expect(await instance.totalSupply()).to.equal(2)
    await expect(instance.ownerOf(3)).to.be.reverted
  })
})
