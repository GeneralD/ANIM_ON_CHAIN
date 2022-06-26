import { keccak256 } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import MerkleTree from 'merkletreejs'

import { AJP } from '../typechain'
import { isProxyDeployed } from './utils/deployedProxy'
import { chiefAddresses, whitelistedAddresses } from './utils/envs'
import { verifyEtherscan } from './utils/verify'

async function main() {
  if (await isProxyDeployed()) throw Error("Proxy has already been deployed! 'Upgrade' instead.")
  if (chiefAddresses.length != 4) throw Error("add all VIPs in .env file")

  // We get the contract to deploy
  const AJP = await ethers.getContractFactory("AJP")
  const instance = await upgrades.deployProxy(AJP) as AJP
  await instance.deployed()
  console.log("proxy deployed to: ", instance.address)

  await instance.setChiefList(createMerkleRoot(chiefAddresses))
  await instance.setWhitelist(createMerkleRoot(whitelistedAddresses))

  await verifyEtherscan(instance.address)
}

function createMerkleRoot(addresses: string[]) {
  const leaves = addresses.map(keccak256)
  const tree = new MerkleTree(leaves, keccak256, { sort: true })
  return tree.getHexRoot()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
