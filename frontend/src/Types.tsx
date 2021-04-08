import { ethers, BigNumber } from "ethers";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";

export type GemData = {
  id: string;
  psi: string;
  number: string;
  activated: boolean;
};

export type UserData = {
  psiBalance: BigNumber;
  gems: GemData[];
};

export type Blockchain = {
  provider: ethers.providers.Web3Provider;
  gems: DeepGems;
  psi: PSI;
};

export type ModalData = GemModalData;

export type GemModalData = {
  type: "GemModal";
  gem: GemData;
};
