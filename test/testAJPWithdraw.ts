import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers, upgrades } from 'hardhat'
import { describe } from 'mocha'

import { AJP, AJPTest1 } from '../typechain'

describe("Withdraw from AJP", () => {
    it("Withdraw all", async () => {
        const [deployer] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        if (await instance.isPublicMintPaused()) await instance.unpausePublicMint()

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

    it("Withdraw beyond updating implementation over the proxy", async () => {
        const [deployer] = await ethers.getSigners()
        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        if (await instance.isPublicMintPaused()) await instance.unpausePublicMint()

        const mintPrice = await instance.PUBLIC_PRICE()
        const paid = mintPrice.mul(100)

        const balanceBeforePay = await deployer.getBalance()
        await instance.publicMint(100, { value: paid })
        const balanceAfterPay = await deployer.getBalance()

        // upgrade implementation
        const AJPTest1 = await ethers.getContractFactory("AJPTest1")
        const upgraded = await upgrades.upgradeProxy(instance, AJPTest1) as AJPTest1

        expect(await upgraded.provider.getBalance(upgraded.address)).to.equal(paid)
        expect(balanceBeforePay.sub(balanceAfterPay).gt(paid)).is.true // gt because of gas

        await upgraded.withdraw()
        const balanceAfterWithdraw = await deployer.getBalance()

        expect(await upgraded.provider.getBalance(upgraded.address)).to.equal(0)
        expect(balanceAfterWithdraw.gt(balanceAfterPay))
        expect(balanceAfterWithdraw.lt(balanceBeforePay)) // lt because of gas
    })

    it("Withdraw with some distributees", async () => {
        const [deployer, distributee1, distributee2, distributee3, distributee4, distributee5, minter] = await ethers.getSigners()
        const distributees = [distributee1, distributee2, distributee3, distributee4, distributee5]

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP
        if (await instance.isPublicMintPaused()) await instance.unpausePublicMint()

        const mintPrice = await instance.PUBLIC_PRICE()
        const quantity = 1_000
        const paid = mintPrice.mul(quantity)

        await expect(await instance.connect(minter).publicMint(quantity, { value: paid }))
            .to.changeEtherBalances([instance, minter], [paid, paid.mul(-1)])

        await instance.setDistribution(distributees.map(d => d.address), 1_000)

        const depositToDistributees = distributees.map(() => paid.mul(1_000).div(10_000))
        const left = paid.sub(depositToDistributees.reduce(
            (accum, value) => accum.add(value), BigNumber.from(0)
        ))

        await expect(await instance.withdraw())
            .to.changeEtherBalances([instance, deployer, ...distributees], [paid.mul(-1), left, ...depositToDistributees])
    })

    it("Set distribution failed when the rate is too much", async () => {
        const [, distributee1, distributee2, distributee3, distributee4, distributee5] = await ethers.getSigners()
        const distributees = [distributee1, distributee2, distributee3, distributee4, distributee5]

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await expect(instance.setDistribution(distributees.map(d => d.address), 2_500))
            .to.revertedWith("too much distribution rate")
    })

    it("Only owner can get distribution", async () => {
        const [, distributee1, distributee2, distributee3, distributee4, distributee5] = await ethers.getSigners()
        const distributees = [distributee1, distributee2, distributee3, distributee4, distributee5]

        const AJP = await ethers.getContractFactory("AJP")
        const instance = await upgrades.deployProxy(AJP) as AJP

        await instance.setDistribution(distributees.map(d => d.address), 1_000)
        const result = await instance.getDistribution()
        expect(result[0]).to.include.all.members(distributees.map(d => d.address))
        expect(result[1]).to.equal(1_000)
    })
})