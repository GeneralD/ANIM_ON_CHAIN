import { expect } from 'chai'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import { MerkleTree } from 'merkletreejs'

describe("AJP whitelist", () => {
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
