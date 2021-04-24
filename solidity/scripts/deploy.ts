import { ethers } from "hardhat";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

async function main() {
  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy()) as PSI;

  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy(
    psi.address,
    "https://cdn.deepge.ms/metadata/"
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
