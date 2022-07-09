import { ethers } from 'hardhat'

import { createMerkleRoot } from '../libs/createMerkleRoot'
import { deployedProxy } from '../libs/deployedProxy'
import { whitelistedAddresses } from '../libs/envs'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)
    await instance.pausePublicMint()
    await instance.setWhitelist(createMerkleRoot(whitelistedAddresses))
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
