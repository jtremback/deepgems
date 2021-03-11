import { ethers } from "hardhat";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

async function main() {
  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy()) as DeepGems;
  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy(gems.address)) as PSI;
  await gems.initialize(psi.address);

  console.log("DeepGems address:", gems.address);
  console.log("Psi address:", psi.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
