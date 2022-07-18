import { ethers } from 'hardhat'

import { createMerkleRoot } from '../libs/createMerkleRoot'
import { deployedProxy } from '../libs/deployedProxy'
import { chiefAddresses } from '../libs/envs'

async function main() {
    if (chiefAddresses.length != 4) throw Error("add all VIPs in .env file")

    // We get the contract to deploy
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)

    console.log(`proxy address: ${instance.address}`)

    const [deployer] = await ethers.getSigners()
    let nonce = await ethers.provider.getTransactionCount(deployer.address)
    await instance.setChiefList(createMerkleRoot(chiefAddresses), { nonce: nonce++ })
    await instance.setDistribution(chiefAddresses, 1_000, { nonce: nonce++ })
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
