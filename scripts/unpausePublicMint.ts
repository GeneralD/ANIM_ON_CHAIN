import { ethers } from 'hardhat'

import { deployedProxy } from './utils/deployedProxy'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)
    await instance.unpausePublicMint()
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
