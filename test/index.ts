import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'

describe("AJP", () => {
  it("Owner can mint", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)
    await instance.adminMint(1000)
    expect(await instance.totalSupply()).to.equal(1000)
  })
})
