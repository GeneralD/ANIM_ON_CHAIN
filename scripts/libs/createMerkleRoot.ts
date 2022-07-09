import { keccak256 } from 'ethers/lib/utils'
import MerkleTree from 'merkletreejs'

export const createMerkleRoot = (addresses: string[]) => {
    const leaves = addresses.map(keccak256)
    const tree = new MerkleTree(leaves, keccak256, { sort: true })
    return tree.getHexRoot()
}