import { network, run, upgrades } from 'hardhat'

export async function verifyEtherscan(proxyAdress: string) {
    if (network.name === "localhost") return null
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAdress)
    console.log("verifying implementation deployed to: ", implementationAddress)
    return await run("verify:verify", {
        address: implementationAddress
    })
}