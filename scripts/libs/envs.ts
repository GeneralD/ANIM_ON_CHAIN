export const chiefAddresses = [
    process.env.CEO_ADDRESS,
    process.env.CTO_ADDRESS,
    process.env.CFO_ADDRESS,
    process.env.CMO_ADDRESS,
].filter((elm?: string): elm is string => elm !== undefined && elm.startsWith("0x"))

export const whitelistedAddresses = [...new Set(
    process.env.WHITELIST_ADDRESSES?.split("\n").filter(address => address.startsWith("0x"))
)]