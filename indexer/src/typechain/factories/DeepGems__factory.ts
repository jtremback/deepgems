/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { DeepGems } from "../DeepGems";

export class DeepGems__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    psiContract: string,
    artistAddresses: string[],
    artistPercentages: BigNumberish[],
    baseURI: string,
    overrides?: Overrides
  ): Promise<DeepGems> {
    return super.deploy(
      psiContract,
      artistAddresses,
      artistPercentages,
      baseURI,
      overrides || {}
    ) as Promise<DeepGems>;
  }
  getDeployTransaction(
    psiContract: string,
    artistAddresses: string[],
    artistPercentages: BigNumberish[],
    baseURI: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(
      psiContract,
      artistAddresses,
      artistPercentages,
      baseURI,
      overrides || {}
    );
  }
  attach(address: string): DeepGems {
    return super.attach(address) as DeepGems;
  }
  connect(signer: Signer): DeepGems__factory {
    return super.connect(signer) as DeepGems__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DeepGems {
    return new Contract(address, _abi, signerOrProvider) as DeepGems;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "psiContract",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "artistAddresses",
        type: "address[]",
      },
      {
        internalType: "uint8[]",
        name: "artistPercentages",
        type: "uint8[]",
      },
      {
        internalType: "string",
        name: "baseURI",
        type: "string",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Activated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Burned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Forged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "oldTokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "newTokenId",
        type: "uint256",
      },
    ],
    name: "Reforged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ARTIST_ADDRESSES",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "ARTIST_PERCENTAGES",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PSI_CONTRACT",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "activate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "artistWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amountPsi",
        type: "uint256",
      },
    ],
    name: "forge",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getGemMetadata",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "oldTokenId",
        type: "uint256",
      },
    ],
    name: "reforge",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "state_commissionCollected",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "state_commissionPaid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "state_unactivatedGems",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b5060405162002b8638038062002b868339810160408190526200003491620004ff565b6040805180820182526009815268446565702047656d7360b81b6020808301918252835180850190945260048452630444545560e41b90840152815191929162000081916000916200022a565b508051620000979060019060208401906200022a565b5050508151835114620000f15760405162461bcd60e51b815260206004820152601560248201527f6d616c666f726d65642061727469737420696e666f000000000000000000000060448201526064015b60405180910390fd5b6000805b8351816001600160401b031610156200015e5783816001600160401b0316815181106200013257634e487b7160e01b600052603260045260246000fd5b60200260200101518262000147919062000664565b9150806200015581620006c9565b915050620000f5565b508060ff16606414620001c25760405162461bcd60e51b815260206004820152602560248201527f6172746973742070657263656e7461676573206d75737420616464207570207460448201526406f203130360dc1b6064820152608401620000e8565b600680546001600160a01b0319166001600160a01b0387161790558351620001f2906007906020870190620002b9565b5082516200020890600890602086019062000311565b5081516200021e9060099060208501906200022a565b5050505050506200071f565b82805462000238906200068c565b90600052602060002090601f0160209004810192826200025c5760008555620002a7565b82601f106200027757805160ff1916838001178555620002a7565b82800160010185558215620002a7579182015b82811115620002a75782518255916020019190600101906200028a565b50620002b5929150620003b4565b5090565b828054828255906000526020600020908101928215620002a7579160200282015b82811115620002a757825182546001600160a01b0319166001600160a01b03909116178255602090920191600190910190620002da565b82805482825590600052602060002090601f01602090048101928215620002a75791602002820160005b838211156200037b57835183826101000a81548160ff021916908360ff16021790555092602001926001016020816000010492830192600103026200033b565b8015620003aa5782816101000a81549060ff02191690556001016020816000010492830192600103026200037b565b5050620002b59291505b5b80821115620002b55760008155600101620003b5565b80516001600160a01b0381168114620003e357600080fd5b919050565b600082601f830112620003f9578081fd5b81516020620004126200040c836200063e565b6200060b565b80838252828201915082860187848660051b890101111562000432578586fd5b855b858110156200046157815160ff811681146200044e578788fd5b8452928401929084019060010162000434565b5090979650505050505050565b600082601f8301126200047f578081fd5b81516001600160401b038111156200049b576200049b62000709565b6020620004b1601f8301601f191682016200060b565b8281528582848701011115620004c5578384fd5b835b83811015620004e4578581018301518282018401528201620004c7565b83811115620004f557848385840101525b5095945050505050565b6000806000806080858703121562000515578384fd5b6200052085620003cb565b602086810151919550906001600160401b03808211156200053f578586fd5b818801915088601f83011262000553578586fd5b8151620005646200040c826200063e565b8082825285820191508585018c878560051b88010111156200058457898afd5b8995505b83861015620005b1576200059c81620003cb565b83526001959095019491860191860162000588565b5060408b01519098509450505080831115620005cb578485fd5b620005d989848a01620003e8565b94506060880151925080831115620005ef578384fd5b5050620005ff878288016200046e565b91505092959194509250565b604051601f8201601f191681016001600160401b038111828210171562000636576200063662000709565b604052919050565b60006001600160401b038211156200065a576200065a62000709565b5060051b60200190565b600060ff821660ff84168060ff03821115620006845762000684620006f3565b019392505050565b600181811c90821680620006a157607f821691505b60208210811415620006c357634e487b7160e01b600052602260045260246000fd5b50919050565b60006001600160401b0382811680821415620006e957620006e9620006f3565b6001019392505050565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b612457806200072f6000396000f3fe608060405234801561001057600080fd5b50600436106101a35760003560e01c806370a08231116100ee578063b260c42a11610097578063d8c7660611610071578063d8c76606146103a0578063e0262855146103a8578063e11ead0a146103bb578063e985e9c5146103e4576101a3565b8063b260c42a14610367578063b88d4fde1461037a578063c87b56dd1461038d576101a3565b8063991a73e5116100c8578063991a73e51461032e578063a22cb46514610341578063a94e834b14610354576101a3565b806370a08231146102c95780638bfecb85146102dc57806395d89b4114610326576101a3565b80633c2a1e201161015057806360409b751161012a57806360409b75146102965780636352211e146102ad5780636ecf649a146102c0576101a3565b80633c2a1e201461024b57806342842e0e1461027057806342966c6814610283576101a3565b8063095ea7b311610181578063095ea7b31461021057806323b872dd146102255780632fe454a714610238576101a3565b806301ffc9a7146101a857806306fdde03146101d0578063081812fc146101e5575b600080fd5b6101bb6101b6366004612099565b610420565b60405190151581526020015b60405180910390f35b6101d8610507565b6040516101c7919061219e565b6101f86101f33660046120d1565b610599565b6040516001600160a01b0390911681526020016101c7565b61022361021e366004612054565b610644565b005b610223610233366004611ef0565b610776565b6101f86102463660046120d1565b6107fd565b61025e6102593660046120d1565b610827565b60405160ff90911681526020016101c7565b61022361027e366004611ef0565b61085b565b6102236102913660046120d1565b610876565b61029f600a5481565b6040519081526020016101c7565b6101f86102bb3660046120d1565b610a62565b61029f600b5481565b61029f6102d7366004611ea4565b610aed565b6102ef6102ea3660046120d1565b610b87565b6040805163ffffffff968716815294861660208601529285169284019290925283166060830152909116608082015260a0016101c7565b6101d8610be5565b6006546101f8906001600160a01b031681565b61022361034f36600461201e565b610bf4565b61029f6103623660046120d1565b610ce4565b6102236103753660046120d1565b610dde565b610223610388366004611f2b565b610ed8565b6101d861039b3660046120d1565b610f66565b61022361104f565b61029f6103b63660046120d1565b611223565b6101f86103c93660046120d1565b600c602052600090815260409020546001600160a01b031681565b6101bb6103f2366004611ebe565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f80ac58cd0000000000000000000000000000000000000000000000000000000014806104b357507fffffffff0000000000000000000000000000000000000000000000000000000082167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806104ff57507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b90505b919050565b6060600080546105169061228c565b80601f01602080910402602001604051908101604052809291908181526020018280546105429061228c565b801561058f5780601f106105645761010080835404028352916020019161058f565b820191906000526020600020905b81548152906001019060200180831161057257829003601f168201915b5050505050905090565b6000818152600260205260408120546001600160a01b03166106285760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b600061064f82610a62565b9050806001600160a01b0316836001600160a01b031614156106d95760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f7200000000000000000000000000000000000000000000000000000000000000606482015260840161061f565b336001600160a01b03821614806106f557506106f581336103f2565b6107675760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c0000000000000000606482015260840161061f565b6107718383611372565b505050565b61078033826113f8565b6107f25760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f766564000000000000000000000000000000606482015260840161061f565b610771838383611500565b6007818154811061080d57600080fd5b6000918252602090912001546001600160a01b0316905081565b6008818154811061083757600080fd5b9060005260206000209060209182820401919006915054906101000a900460ff1681565b61077183838360405180602001604052806000815250610ed8565b6000818152600c60205260409020546001600160a01b03163314156108ce576000818152600c6020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055610985565b6000818152600260205260409020546001600160a01b0316151580156109045750336108f982610a62565b6001600160a01b0316145b1561091757610912816116e5565b610985565b60405162461bcd60e51b815260206004820152602b60248201527f746869732067656d20646f6573206e6f74206578697374206f7220796f75206460448201527f6f6e2774206f776e206974000000000000000000000000000000000000000000606482015260840161061f565b6006546040517fa9059cbb0000000000000000000000000000000000000000000000000000000081523360048201526fffffffffffffffffffffffffffffffff831660248201526001600160a01b039091169063a9059cbb90604401602060405180830381600087803b1580156109fb57600080fd5b505af1158015610a0f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a33919061207d565b5060405181907fd83c63197e8e676d80ab0122beba9a9d20f3828839e9a1d6fe81d242e9cd7e6e90600090a250565b6000818152600260205260408120546001600160a01b0316806104ff5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e0000000000000000000000000000000000000000000000606482015260840161061f565b60006001600160a01b038216610b6b5760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f206164647265737300000000000000000000000000000000000000000000606482015260840161061f565b506001600160a01b031660009081526003602052604090205490565b600080808080608086901c8682610ba6670de0b6b3a7640000836121c9565b606084901c63ffffffff169a604085901c67ffffffffffffffff169a50602085901c6bffffffffffffffffffffffff1699509397509550919350505050565b6060600180546105169061228c565b6001600160a01b038216331415610c4d5760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c657200000000000000604482015260640161061f565b3360008181526005602090815260408083206001600160a01b038716808552925290912080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016841515179055906001600160a01b03167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610cd8911515815260200190565b60405180910390a35050565b6006546040517ffe9b9ad5000000000000000000000000000000000000000000000000000000008152336004820152602481018390526000916001600160a01b03169063fe9b9ad590604401600060405180830381600087803b158015610d4a57600080fd5b505af1158015610d5e573d6000803e3d6000fd5b50505050600080610d6e84611798565b6000828152600c602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001633179055600a8390555192945090925083917fa22a31dd1a00f78bee760c51c0ef685aca8f4bec18943fe176e64d80379cc15e9190a25092915050565b6000818152600c60205260409020546001600160a01b03163314610e6c576040805162461bcd60e51b81526020600482015260248101919091527f67656d20697320616c7265616479206163746976617465642c20796f7520646f60448201527f6e2774206f776e2069742c206f7220697420646f6573206e6f74206578697374606482015260840161061f565b6000818152600c6020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055610eaa3382611921565b60405181907f3ec796be1be7d03bff3a62b9fa594a60e947c1809bced06d929f145308ae57ce90600090a250565b610ee233836113f8565b610f545760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f766564000000000000000000000000000000606482015260840161061f565b610f6084848484611a7b565b50505050565b6000818152600260205260409020546060906001600160a01b0316610ff35760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e0000000000000000000000000000000000606482015260840161061f565b6000610ffd611b04565b9050600081511161101d5760405180602001604052806000815250611048565b8061102784611b13565b604051602001611038929190612133565b6040516020818303038152906040525b9392505050565b6000600b54600a546110619190612249565b905060006110706064836121f8565b600a54600b55905060005b60075467ffffffffffffffff8216101561077157600654600780546001600160a01b039092169163a9059cbb919067ffffffffffffffff85169081106110ea577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b9060005260206000200160009054906101000a90046001600160a01b03168460088567ffffffffffffffff168154811061114d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b90600052602060002090602091828204019190069054906101000a900460ff1660ff1661117a919061220c565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b1681526001600160a01b0390921660048301526024820152604401602060405180830381600087803b1580156111d857600080fd5b505af11580156111ec573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611210919061207d565b508061121b81612319565b91505061107b565b6000818152600c60205260408120546001600160a01b031633146112b1576040805162461bcd60e51b81526020600482015260248101919091527f67656d20697320616c7265616479206163746976617465642c20796f7520646f60448201527f6e2774206f776e2069742c206f7220697420646f6573206e6f74206578697374606482015260840161061f565b6000828152600c6020526040812080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055806113016fffffffffffffffffffffffffffffffff8516611798565b6000828152600c602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001633179055600a83905551929450909250839186917f0ac50292890370017bcbe7f41421fb0c343be2b92f45e7538af33f84fdb4ee7991a35092915050565b600081815260046020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b03841690811790915581906113bf82610a62565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000818152600260205260408120546001600160a01b03166114825760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e0000000000000000000000000000000000000000606482015260840161061f565b600061148d83610a62565b9050806001600160a01b0316846001600160a01b031614806114c85750836001600160a01b03166114bd84610599565b6001600160a01b0316145b806114f857506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b949350505050565b826001600160a01b031661151382610a62565b6001600160a01b03161461158f5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e0000000000000000000000000000000000000000000000606482015260840161061f565b6001600160a01b03821661160a5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f7265737300000000000000000000000000000000000000000000000000000000606482015260840161061f565b611615600082611372565b6001600160a01b038316600090815260036020526040812080546001929061163e908490612249565b90915550506001600160a01b038216600090815260036020526040812080546001929061166c9084906121b1565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b60006116f082610a62565b90506116fd600083611372565b6001600160a01b0381166000908152600360205260408120805460019290611726908490612249565b909155505060008281526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055518391906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a45050565b600080806117a76014856121f8565b905060006117b58286612249565b9050600082600a546117c791906121b1565b9050600061184961180a6117e367016345785d8a0000856121f8565b6117eb611c94565b60ff1660089190911b6fffffffffffffffffffffffffffffff00161790565b846fffffffffffffffffffffffffffffffff1660809190911b7fffffffffffffffffffffffffffffffff00000000000000000000000000000000161790565b6000818152600c60205260409020549091506001600160a01b0316156118b15760405162461bcd60e51b815260206004820152601960248201527f74727920666f7267696e672077697468206d6f72652050534900000000000000604482015260640161061f565b6000818152600260205260409020546001600160a01b0316156119165760405162461bcd60e51b815260206004820152601960248201527f74727920666f7267696e672077697468206d6f72652050534900000000000000604482015260640161061f565b945092505050915091565b6001600160a01b0382166119775760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f2061646472657373604482015260640161061f565b6000818152600260205260409020546001600160a01b0316156119dc5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000604482015260640161061f565b6001600160a01b0382166000908152600360205260408120805460019290611a059084906121b1565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b611a86848484611500565b611a9284848484611cc2565b610f605760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e7465720000000000000000000000000000606482015260840161061f565b6060600980546105169061228c565b606081611b54575060408051808201909152600181527f30000000000000000000000000000000000000000000000000000000000000006020820152610502565b8160005b8115611b7e5780611b68816122e0565b9150611b779050600a836121f8565b9150611b58565b60008167ffffffffffffffff811115611bc0577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f191660200182016040528015611bea576020820181803683370190505b5090505b84156114f857611bff600183612249565b9150611c0c600a86612341565b611c179060306121b1565b60f81b818381518110611c53577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611c8d600a866121f8565b9450611bee565b60006004611ca360ff43612249565b4060ff16901c6004611cb6600143612249565b4060ff16901b17919050565b60006001600160a01b0384163b15611e82576040517f150b7a020000000000000000000000000000000000000000000000000000000081526001600160a01b0385169063150b7a0290611d1f903390899088908890600401612162565b602060405180830381600087803b158015611d3957600080fd5b505af1925050508015611d87575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201909252611d84918101906120b5565b60015b611e37573d808015611db5576040519150601f19603f3d011682016040523d82523d6000602084013e611dba565b606091505b508051611e2f5760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e7465720000000000000000000000000000606482015260840161061f565b805181602001fd5b7fffffffff00000000000000000000000000000000000000000000000000000000167f150b7a02000000000000000000000000000000000000000000000000000000001490506114f8565b506001949350505050565b80356001600160a01b038116811461050257600080fd5b600060208284031215611eb5578081fd5b61104882611e8d565b60008060408385031215611ed0578081fd5b611ed983611e8d565b9150611ee760208401611e8d565b90509250929050565b600080600060608486031215611f04578081fd5b611f0d84611e8d565b9250611f1b60208501611e8d565b9150604084013590509250925092565b60008060008060808587031215611f40578081fd5b611f4985611e8d565b9350611f5760208601611e8d565b925060408501359150606085013567ffffffffffffffff80821115611f7a578283fd5b818701915087601f830112611f8d578283fd5b813581811115611f9f57611f9f6123b3565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715611fe557611fe56123b3565b816040528281528a6020848701011115611ffd578586fd5b82602086016020830137918201602001949094529598949750929550505050565b60008060408385031215612030578182fd5b61203983611e8d565b91506020830135612049816123e2565b809150509250929050565b60008060408385031215612066578182fd5b61206f83611e8d565b946020939093013593505050565b60006020828403121561208e578081fd5b8151611048816123e2565b6000602082840312156120aa578081fd5b8135611048816123f3565b6000602082840312156120c6578081fd5b8151611048816123f3565b6000602082840312156120e2578081fd5b5035919050565b60008151808452612101816020860160208601612260565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b60008351612145818460208801612260565b835190830190612159818360208801612260565b01949350505050565b60006001600160a01b0380871683528086166020840152508360408301526080606083015261219460808301846120e9565b9695505050505050565b60006020825261104860208301846120e9565b600082198211156121c4576121c4612355565b500190565b60006fffffffffffffffffffffffffffffffff808416806121ec576121ec612384565b92169190910492915050565b60008261220757612207612384565b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff048311821515161561224457612244612355565b500290565b60008282101561225b5761225b612355565b500390565b60005b8381101561227b578181015183820152602001612263565b83811115610f605750506000910152565b600181811c908216806122a057607f821691505b602082108114156122da577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561231257612312612355565b5060010190565b600067ffffffffffffffff8083168181141561233757612337612355565b6001019392505050565b60008261235057612350612384565b500690565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b80151581146123f057600080fd5b50565b7fffffffff00000000000000000000000000000000000000000000000000000000811681146123f057600080fdfea2646970667358221220afb20f47feefb36460d923dded3b3f3b5967ba91569170216dd3bc32a96d3c2064736f6c63430008030033";
