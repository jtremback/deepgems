import { ethers } from "hardhat";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

async function main() {
  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy()) as PSI;

  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy(
    psi.address,
    ["0xAB24c97524De9f7Bc8D6f1b8cF5c3ceC77323387"],
    [100],
    "https://deepge.ms/tokenId/"
  )) as DeepGems;

  await psi.initialize(gems.address);

  console.log("DeepGems address:", gems.address);
  console.log("Psi address:", psi.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
