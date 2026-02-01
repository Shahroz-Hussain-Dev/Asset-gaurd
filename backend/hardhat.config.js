require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24", // match your contract pragma
      },
    ],
  },
  defaultNetwork: "hardhat",
};
