const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth.js")
async function main() {
    //protocal treats everything as an erc 20 token
    //eth and native blockchian isn't erc 20 token
    //the reason why we do this is becuase it makes everything easier
    //wrapped erc is bascially eth but wrapped as an erc-20 token
    await getWeth()
    const { deployer } = await getNamedAccounts()

    //now we want to interact with the aave protocol

    //lending pool address provider: 0xb53c1a33016b2dc2ff3653530bff1848a515c8c5
    const LendingPool = await getLendingPool(deployer)
    console.log(`the lending pool contract at ${LendingPool.address}`)

    //deposit !
    //by looking at the deposit function in the aave github https://github.com/aave/protocol-v2/blob/master/contracts/protocol/lendingpool/LendingPool.sol
    /*
        IERC20(asset).safeTransferFrom(msg.sender, aToken, amount); gets money out of our wallet 
        so we have to approve it
        let us get the weth token first
    */
    const wethTokenAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    //approve !
    //THE weth token address is where we are going to get the weth from ...
    console.log(`deployer address ${deployer}`)
    await approveErc20(wethTokenAddress, LendingPool.address, AMOUNT, deployer)
    console.log(`depositing....`)
    await LendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("deposited!")

    //you can look at paramters on the docs.
    /*
        the first is the type of asset we are depositing --> which isa weth 
    */

    //first we need to grab all the info about a user getUserAccountData() --> where you can see health factor etc, liquidation threshold, we want to see how much we can borrow
    let { totalCollateralETH, totalDebtETH, availableBorrowsETH } = getBorrowUserData(
        LendingPool,
        deployer
    )

    //since we want to borrow dai, we want to convert eth to dai !  --> by using chainlink price feeds
    const daiPrice = await getDaiPrice()
    //now let us figure out how much we can borrow in dai?
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice)
    //but we need the amount in wei
    const DaiAmountInWei = ether.utils.parseEther(amountDaiToBorrow.toString()) //THIS RETURNS the big number representation of dai
    //question, this parses ethers, but how would that parse dai to wei?
}

async function getDaiPrice() {
    const DaiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
        //no need to connect to deployer since we are sending any trasnfactions, we are just reading
    )
    const price = await DaiEthPriceFeed.latestRoundData()[1] //since answer is at the first index
    console.log(`dai/eth price is ${price.toString()}`)
}
async function getBorrowUserData(lendingpool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingpool.getUserAccountData(account)
    console.log(`you have total collateral eth of ${totalCollateralETH}`)
    console.log(`you have ${totalDebtETH} in debt `)
    console.log(`you have ${availableBorrowsETH} eth to borrow`)
    return { totalCollateralETH, totalDebtETH, availableBorrowsETH }
}
async function approveErc20(ERC20Address, spenderAddress, amountToSpend, account) {
    //the address of our erc20 token lcoation
    //contract address
    //spender address: contract we are going to give approval to
    //account --> to do all this on
    const erc20Token = await ethers.getContractAt("IERC20", ERC20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend) //with the weth contract
    //we can approve it taking funds out of our wallet and giving it to the lending pool!!!
    await tx.wait(1)
    console.log("token approved ")
}
async function getLendingPool(deloyer) {
    const ILendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
        deloyer
    )
    const lendingPoolAddress = await ILendingPoolAddressProvider.getLendingPool()
    //now we want to get the lendingpool contract
    //need abi and contract addresss which we have already
    const contract = await ethers.getContractAt("ILendingPool", lendingPoolAddress, deployer)
    // we need a deployer here since we are sending transcations

    //if i specify deployer. it fails, I do not know why
    return contract
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
