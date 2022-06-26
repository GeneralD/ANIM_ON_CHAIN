import { ethers, network, run, upgrades } from 'hardhat'

import { AJP } from '../typechain'
import { deployedProxy } from './utils/deployedProxy'
import { verifyEtherscan } from './utils/verify'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = await upgrades.upgradeProxy((await deployedProxy()).address, AJP) as AJP
    await instance.deployed()
    console.log(`proxy address: ${instance.address}`)

    await verifyEtherscan(instance.address)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
