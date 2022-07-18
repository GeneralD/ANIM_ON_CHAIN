import { ethers } from 'hardhat'

import { deployedProxy } from '../libs/deployedProxy'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)

    const [deployer] = await ethers.getSigners()
    const nonce = await ethers.provider.getTransactionCount(deployer.address)
    await instance.unpausePublicMint({ nonce: nonce })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
