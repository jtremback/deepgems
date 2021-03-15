import { ethers } from "hardhat";
import { PSI } from "../typechain/PSI";
import { DeepGems } from "../typechain/DeepGems";

const fe = ethers.utils.formatEther;
const pe = ethers.utils.parseEther;

async function main() {
  const DeepGemsContract = await ethers.getContractFactory("DeepGems");
  const gems = (await DeepGemsContract.deploy()) as DeepGems;
  const PSIContract = await ethers.getContractFactory("PSI");
  const psi = (await PSIContract.deploy(gems.address)) as PSI;
  await gems.initialize(psi.address);

  console.log("DeepGems address:", gems.address);
  console.log("Psi address:", psi.address);

  await psi.mint(pe("1000"), { value: pe(`100`) });

  await gems.forge(pe("100"));
  await gems.forge(pe("200"));
  await gems.forge(pe("200"));
  await gems.forge(pe("100"));
  await gems.forge(pe("50"));
  await gems.forge(pe("50"));
  await gems.forge(pe("300"));

  const events = await gems.queryFilter({
    address: gems.address,
    topics: [
      "0x7ad4b12ff4ce0fdd55b19da97f85fc9a091971912adda4a8bba51626c4cd5469",
    ],
  });

  console.log(events);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
