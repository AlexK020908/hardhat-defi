require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
/** @type import('hardhat/config').HardhatUserConfig */
const MAINNET_RPC_URL = "https://mainnet.infura.io/v3/"
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.8",
            },
            {
                version: "0.6.12",
            },
            {
                version: "0.4.19",
            },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            forking: {
                url: process.env.MAINNET_RPC_URL,
            },
        },
        rinkeby: {
            url: process.env.RINKEBY_RPC_URL || "",
            accounts: [process.env.My_Private_key],
            chainId: 4,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: process.env.ETH_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    //mocha is for the promis we wrote in the test
    mocha: {
        timeout: 500000, //500 seconds
    },
}
