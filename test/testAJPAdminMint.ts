import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'

describe("Mint AJP", () => {
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
})
