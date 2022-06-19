import { network, upgrades } from 'hardhat'

import object from '../../.openzeppelin/goerli.json'
import config from '../../hardhat.config'

type Json = typeof object

export const deployedProxy = async () => {
    const json: Json = await import(`../../.openzeppelin/${networkFileName()}.json`)
    if (!json.proxies.length) throw new Error("proxy is not deployed yet")
    // use last proxy
    return json.proxies.slice(-1)[0]
}

export const isProxyDeployed = async () => {
    try {
        const proxy = await deployedProxy()
        // chain on localhost is disposable but json is left even the chain is discarded.
        // so need to check if the proxy is currently on chain.
        if (network.name == 'localhost') {
            return await upgrades.erc1967.getAdminAddress(proxy.address) !== "0x0000000000000000000000000000000000000000"
        }
        return true
    } catch {
        return false
    }
}

const networkFileName = () => {
    if (network.name != 'localhost') return network.name
    const chainId = config.networks?.hardhat?.chainId || 1337
    return `unknown-${chainId}`
}
