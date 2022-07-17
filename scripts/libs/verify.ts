import { network, run, upgrades } from 'hardhat'

export async function verifyEtherscan(proxyAdress: string, verify: "proxy" | "implementation" = "proxy") {
    if (network.name === "localhost") return null
    switch (verify) {
        case 'proxy':
            console.log("verifying proxy deployed to: ", proxyAdress)
            return await run("verify:verify", {
                address: proxyAdress
            })
        case 'implementation':
            const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAdress)
            console.log("verifying implementation deployed to: ", implementationAddress)
            return await run("verify:verify", {
                address: implementationAddress
            })
    }
}