import { ethers, BigNumber } from "ethers";
import { DeepGems } from "../../solidity/typechain/DeepGems";
import { PSI } from "../../solidity/typechain/PSI";

export type GemData = {
  id: string;
  psi: string;
  number: string;
  activated: boolean;
  forgeTime: number;
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

export type CurrentPsiData = {
  totalSupply: number;
  etherPrice: number;
  eth: { price: number; marketCap: number };
  dollars: { price: number; marketCap: number };
};

export type ModalData = GemModalData;

export type GemModalData = {
  type: "GemModal";
  gem: GemData;
};

export type CurveDataPoint = {
  price: number;
  totalSupply: number;
  marketCap: number;
};
