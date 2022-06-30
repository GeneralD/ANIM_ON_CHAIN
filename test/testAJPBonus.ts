import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP } from '../typechain'

describe("AJP whitelist bonus", () => {
  it("Check bonus", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(100)
    const quantity = BigNumber.from(25)
    const bonusPer = await instance.WHITELIST_BONUS_PER()
    expect(await instance.bonusQuantity(quantity)).to.equal(quantity.add(quantity.div(bonusPer)))
  })

  it("Check bonus failed if not enough stocks", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(10)
    await expect(instance.bonusQuantity(11)).to.reverted
  })

  it("Full bonus is not given when not enough stocks to give bonus", async () => {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(30)
    expect(await instance.bonusQuantity(29)).to.equal(30)
  })
})
