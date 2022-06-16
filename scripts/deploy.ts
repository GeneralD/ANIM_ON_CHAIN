// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { assert } from 'console'
import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import MerkleTree from 'merkletreejs'

import { AJP } from '../typechain'

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile')

  // list of important guys
  const chiefAddresses = [
    process.env.CEO_ADDRESS,
    process.env.CTO_ADDRESS,
    process.env.CFO_ADDRESS,
    process.env.CMO_ADDRESS,
  ].filter((elm?: string): elm is string => elm !== undefined && elm.startsWith("0x"))
  assert(chiefAddresses.length == 4, 'add all VIPs in .env file')

  // We get the contract to deploy
  const AJP = await ethers.getContractFactory("AJP")
  const instance = await upgrades.deployProxy(AJP) as AJP
  await instance.deployed()
  console.log("AJP deployed to:", instance.address)

  // register merkle root of the guys
  const leaves = chiefAddresses.map(keccak256)
  const tree = new MerkleTree(leaves, keccak256, { sort: true })
  const root = tree.getHexRoot()
  console.log(`Merkle root of ${chiefAddresses.length} guys is: ${root}`)

  // check if all chief members are validated
  const areAllChiefsValid = chiefAddresses.every(async address => {
    const leaf = keccak256(address)
    const proof = tree.getHexProof(leaf)
    return await instance.connect(address).areYouChief(proof)
  })

  if (areAllChiefsValid) {
    console.log("nice! chiefs merkle root is alredy set in contract.")
  } else {
    console.log("chiefs merkle root is set. don't forget updating hardcoded in contract!")
    await instance.setChiefList(root)
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
