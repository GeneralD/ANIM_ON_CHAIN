import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

describe("AJP whitelist bonus", () => {
  it("Check prerequisites", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)
    expect(await instance.WHITELIST_BONUS_PER()).is.equal(10, "solidity code changed?")
  })

  it("Check bonus", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(100)
    expect(await instance.bonusQuantity(25)).to.equal(27)
  })

  it("Check bonus failed if not enough stocks", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(10)
    await expect(instance.bonusQuantity(11)).to.reverted
  })

  it("Full bonus is not given when not enough stocks to give bonus", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setMintLimit(30)
    expect(await instance.bonusQuantity(29)).to.equal(30)
  })
})
