//you basically deposit ether and in return u get wrapped ether

const { getNamedAccounts, ethers } = require("hardhat")
const AMOUNT = ethers.utils.parseEther("0.02")
async function getWeth() {
    const { deployer } = await getNamedAccounts() //so we can iteract with the weth contract

    //need abi (compile) and contract address to interact with an address
    //0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2   why did we use the mainnet address
    //mainnet addres for weth

    //don't we need a mock?

    /*
        hardhat has what is called forking from mainnet

        but there are tradeoffs

        pros:quick easy
        cons: we need an API, some contracts are complex to work with

    */
    const iWeth = await ethers.getContractAt("IWeth", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") //defaulted to deployer
    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)
    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`you have ${wethBalance.toString()} Weth`)
}

module.exports = { getWeth, AMOUNT }

// const { ethers, getNamedAccounts, network } = require("hardhat")

// const AMOUNT = ethers.utils.parseEther("0.01")

// async function getWeth() {
//     const { deployer } = await getNamedAccounts()
//     const iWeth = await ethers.getContractAt("IWeth", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") //defaulted to deployer
//     const txResponse = await iWeth.deposit({
//         value: AMOUNT,
//     })
//     await txResponse.wait(1)
//     const wethBalance = await iWeth.balanceOf(deployer)
//     console.log(`Got ${wethBalance.toString()} WETH`)
// }

// module.exports = { getWeth }
