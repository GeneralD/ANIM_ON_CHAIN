import { keccak256 } from 'ethers/lib/utils'

import { chiefAddresses } from '../libs/envs'

async function main() {
    console.log(`const hashedChiefAddresses = [\n${chiefAddresses.map(keccak256).map(s => `    "${s}"`).join(",\n")}\n]`)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
