import { ethers, upgrades } from 'hardhat'

import { AJP } from '../typechain'
import { deployedProxy } from './utils/deployedProxy'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.upgradeProxy((await deployedProxy()).address, AJP) as AJP
    await instance.deployed()
    console.log(`Proxy address: ${instance.address}`)
    console.log(`New implementation address: ${await upgrades.erc1967.getImplementationAddress(instance.address)}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
