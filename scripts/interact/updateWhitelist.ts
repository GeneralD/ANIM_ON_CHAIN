import { ethers } from 'hardhat'

import { createMerkleRoot } from '../libs/createMerkleRoot'
import { deployedProxy } from '../libs/deployedProxy'
import { whitelistedAddresses } from '../libs/envs'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)

    const [deployer] = await ethers.getSigners()
    let nonce = await ethers.provider.getTransactionCount(deployer.address)
    await instance.setWhitelist(createMerkleRoot(whitelistedAddresses), { nonce: nonce++ })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
