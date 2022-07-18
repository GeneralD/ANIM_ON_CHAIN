import { expect, use } from 'chai'
import chaiArrays from 'chai-arrays'
import { ethers, upgrades } from 'hardhat'
import { describe, it } from 'mocha'

import { AJP, AJPVer2 } from '../typechain'

use(chaiArrays)

describe("Force transfer AJP token by admin", () => {
  it("Owner can transfer token forcely", async () => {
    const [, john, jonny, jonathan] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    expect(await instance.tokensOfOwner(john.address)).to.ofSize(4)
    expect(await instance.ownerOf(1)).to.equal(john.address)
    expect(await instance.ownerOf(2)).to.equal(john.address)
    expect(await instance.ownerOf(3)).to.equal(john.address)
    expect(await instance.ownerOf(4)).to.equal(john.address)

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    await upgraded.adminForceTransferFrom(john.address, jonny.address, 2)
    await upgraded.adminForceTransferFrom(john.address, jonathan.address, 4)

    expect(await upgraded.tokensOfOwner(john.address)).to.ofSize(2)
    expect(await instance.ownerOf(1)).to.equal(john.address)
    expect(await upgraded.ownerOf(2)).to.equal(jonny.address)
    expect(await instance.ownerOf(3)).to.equal(john.address)
    expect(await upgraded.ownerOf(4)).to.equal(jonathan.address)
  })

  it("When from value is wrong, should be reverted", async () => {
    const [, john, jonny, jonathan] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    // should be succeeded
    await upgraded.adminForceTransferFrom(john.address, jonathan.address, 1)
    expect(await instance.ownerOf(1)).to.equal(jonathan.address)

    // should be failed
    await expect(upgraded.adminForceTransferFrom(john.address, jonny.address, 1)).reverted
    expect(await instance.ownerOf(1)).to.equal(jonathan.address)
  })

  it("When from tokenId not exist, should be reverted", async () => {
    const [, john, jonny] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    await expect(upgraded.adminForceTransferFrom(john.address, jonny.address, 5)).reverted
  })

  it("When from tokenId not exist, should be reverted", async () => {
    const [, john, jonny] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    await expect(upgraded.adminForceTransferFrom(john.address, jonny.address, 5)).reverted
  })

  it("When sender is not an owner of the token, transferFrom should be reverted", async () => {
    const [, john, jonny] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    // standard transferFrom should be failed
    await expect(instance.transferFrom(john.address, jonny.address, 2)).reverted

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    // but adminForceTransferFrom is ok
    await upgraded.adminForceTransferFrom(john.address, jonny.address, 2)
    expect(await upgraded.ownerOf(2)).to.equal(jonny.address)
  })


  it("When to is zero address, it should be reverted", async () => {
    const [, john] = await ethers.getSigners()
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP) as AJP

    await instance.setMintLimit(2000)
    await instance.adminMintTo(john.address, 4)

    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const upgraded = await upgrades.upgradeProxy(instance, AJPVer2) as AJPVer2

    // but adminForceTransferFrom is ok
    await expect(upgraded.adminForceTransferFrom(john.address, "0x0000000000000000000000000000000000000000", 3)).to.reverted
  })
})
