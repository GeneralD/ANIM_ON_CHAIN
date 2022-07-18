import { ethers } from 'hardhat'

import { deployedProxy } from '../../libs/deployedProxy'

async function main() {
    const AJPVer2 = await ethers.getContractFactory("AJPVer2")
    const instance = AJPVer2.attach((await deployedProxy()).address)

    const [deployer] = await ethers.getSigners()
    const nonce = await ethers.provider.getTransactionCount(deployer.address)
    await instance.adminForceTransferFrom(
        "0xeB6c4bE4b92a52e969F4bF405025D997703D5383",
        "0x5eBA2E9dc156580bfEA35ed22f4e96f4F750CE0E",
        4, { nonce: nonce })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
