import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { describe } from 'mocha'

import { AJP } from '../typechain'

describe("Withdraw from AJP", () => {
    it("Withdraw all", async () => {
        const [deployer] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        const mintPrice = await instance.PUBLIC_PRICE()
        const paid = mintPrice.mul(100)

        const balanceBeforePay = await deployer.getBalance()
        await instance.publicMint(100, { value: paid })
        const balanceAfterPay = await deployer.getBalance()

        expect(await instance.provider.getBalance(instance.address)).to.equal(paid)
        expect(balanceBeforePay.sub(balanceAfterPay).gt(paid)).is.true // gt because of gas

        await instance.withdraw()
        const balanceAfterWithdraw = await deployer.getBalance()

        expect(await instance.provider.getBalance(instance.address)).to.equal(0)
        expect(balanceAfterWithdraw.gt(balanceAfterPay))
        expect(balanceAfterWithdraw.lt(balanceBeforePay)) // lt because of gas
    })

    it("Nobody can withdraw other than owner", async () => {
        const [, badguy] = await ethers.getSigners()

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.withdraw() // ok
        await expect(instance.connect(badguy).withdraw()).to.revertedWith("Ownable: caller is not the owner")
    })
})