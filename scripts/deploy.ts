import { ethers, upgrades } from 'hardhat'

import { AJP } from '../typechain'
import { createMerkleRoot } from './libs/createMerkleRoot'
import { isProxyDeployed } from './libs/deployedProxy'
import { chiefAddresses } from './libs/envs'

async function main() {
  if (await isProxyDeployed()) throw Error("Proxy has already been deployed! 'Upgrade' instead.")
  if (chiefAddresses.length != 4) throw Error("add all VIPs in .env file")

  // We get the contract to deploy
  const AJP = await ethers.getContractFactory("AJP")
  const instance = await upgrades.deployProxy(AJP) as AJP
  await instance.deployed()
  console.log("proxy deployed to: ", instance.address)

  // await instance.setWhitelist(createMerkleRoot(whitelistedAddresses))

  await instance.setChiefList(createMerkleRoot(chiefAddresses))
  await instance.setDistribution(chiefAddresses, 1_000)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
