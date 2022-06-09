import { expect } from 'chai'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { MerkleTree } from 'merkletreejs'

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

  it("Whitelisted member can mint", async () => {
    const [, john, jonny, jonathan] = await ethers.getSigners()
    const whitelisted = [john, jonny, jonathan]

    const leaves = whitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setWhitelist(root)

    // john is whitelisted
    const proofOfJohn = tree.getHexProof(keccak256(john.address))
    expect(await instance.connect(john.address).isWhitelisted(proofOfJohn)).is.true
    // jonny is whitelisted
    const proofOfJonny = tree.getHexProof(keccak256(jonny.address))
    expect(await instance.connect(jonny.address).isWhitelisted(proofOfJonny)).is.true
    // jonathan is whitelisted
    const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
    expect(await instance.connect(jonathan.address).isWhitelisted(proofOfJonathan)).is.true
  })

  it("Not whitelisted member can't mint", async () => {
    const [deployer, john, jonny, jonathan, mike, michael, mick] = await ethers.getSigners()
    const whitelisted = [john, jonny, jonathan]

    const leaves = whitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setWhitelist(root)
    // deployer is not whitelisted
    const proofOfDeployer = tree.getHexProof(keccak256(deployer.address))
    expect(await instance.isWhitelisted(proofOfDeployer)).is.false
    // mike is not whitelisted
    const proofOfMike = tree.getHexProof(keccak256(mike.address))
    expect(await instance.isWhitelisted(proofOfMike)).is.false
    expect(await instance.connect(mike.address).isWhitelisted(proofOfDeployer)).is.false
    // michael is not whitelisted
    const proofOfMichael = tree.getHexProof(keccak256(michael.address))
    expect(await instance.connect(michael.address).isWhitelisted(proofOfMichael)).is.false
    // mick is not whitelisted
    const proofOfMick = tree.getHexProof(keccak256(mick.address))
    expect(await instance.connect(mick.address).isWhitelisted(proofOfMick)).is.false
  })

  it("Other's hex proof is not valid", async () => {
    const [, john, jonny, jonathan, mike] = await ethers.getSigners()
    const whitelisted = [john, jonny, jonathan]

    const leaves = whitelisted.map(account => keccak256(account.address))
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    const root = tree.getHexRoot()

    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.deployProxy(AJP)

    await instance.setWhitelist(root)

    const proofOfJohn = tree.getHexProof(keccak256(john.address))
    expect(await instance.connect(mike.address).isWhitelisted(proofOfJohn)).is.false

    const proofOfJonny = tree.getHexProof(keccak256(jonny.address))
    expect(await instance.connect(mike.address).isWhitelisted(proofOfJonny)).is.false

    const proofOfJonathan = tree.getHexProof(keccak256(jonathan.address))
    expect(await instance.connect(mike.address).isWhitelisted(proofOfJonathan)).is.false

    // they are whitelisted, but other member's proof is not valid
    expect(await instance.connect(jonny.address).isWhitelisted(proofOfJohn)).is.false
    expect(await instance.connect(jonny.address).isWhitelisted(proofOfJonathan)).is.false
  })
})
