import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'

describe("Burn AJP", () => {
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
