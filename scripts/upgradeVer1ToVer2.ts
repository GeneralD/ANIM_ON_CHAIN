import { ethers, upgrades } from 'hardhat'

import { AJPVer2 } from '../typechain/AJPVer2'
import { deployedProxy } from './libs/deployedProxy'
import { verifyEtherscan } from './libs/verify'

async function main() {
    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const instance = await upgrades.upgradeProxy((await deployedProxy()).address, AJPVer2) as AJPVer2
    await instance.deployed()
    console.log(`proxy address: ${instance.address}`)

    await verifyEtherscan(instance.address)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
