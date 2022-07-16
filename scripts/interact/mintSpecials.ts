import { ethers } from 'hardhat'

import { deployedProxy } from '../libs/deployedProxy'
import { chiefAddresses } from '../libs/envs'

async function main() {
    const AJP = await ethers.getContractFactory("AJP")
    const instance = AJP.attach((await deployedProxy()).address)

    if ((await instance.totalSupply()).gt(0)) {
        console.error("Already minted!")
        return
    }

    const addresses = chiefAddresses
    if (addresses.length !== 4) {
        console.error("Fill all chiefs in env file!")
        return
    }

    for (let index = 0; index < addresses.length; index++) {
        const address = addresses[index]
        await instance.adminMintTo(address, 1)
    }

    console.log(`totalSupply: ${await instance.totalSupply()}`)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
