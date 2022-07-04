import { keccak256 } from 'ethers/lib/utils'

import { whitelistedAddresses } from '../utils/envs'

async function main() {
    console.log(`const hashedWhitelistAddresses = [\n${whitelistedAddresses.map(keccak256).map(s => `    "${s}"`).join(",\n")}\n]`)
}

main().catch(error => {
    console.error(error)
    process.exitCode = 1
})
