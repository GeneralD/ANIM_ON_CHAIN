import { ethers, upgrades } from 'hardhat'

import { AJP } from '../typechain'
import { deployedProxy } from './libs/deployedProxy'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.upgradeProxy((await deployedProxy()).address, AJP) as AJP
    await instance.deployed()
    console.log(`proxy address: ${instance.address}`)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
