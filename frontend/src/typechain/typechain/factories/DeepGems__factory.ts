/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { DeepGems } from "../DeepGems";

export class DeepGems__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    psiContract: string,
    baseURI: string,
    overrides?: Overrides
  ): Promise<DeepGems> {
    return super.deploy(
      psiContract,
      baseURI,
      overrides || {}
    ) as Promise<DeepGems>;
  }
  getDeployTransaction(
    psiContract: string,
    baseURI: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(psiContract, baseURI, overrides || {});
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "counterFromTokenId",
    outputs: [
      {
        internalType: "uint120",
        name: "",
        type: "uint120",
      },
    ],
    stateMutability: "pure",
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
        name: "oldtokenId",
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
    name: "state_counter",
    outputs: [
      {
        internalType: "uint120",
        name: "",
        type: "uint120",
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
  "0x60806040523480156200001157600080fd5b50604051620024b5380380620024b5833981016040819052620000349162000179565b6040805180820182526009815268446565702047656d7360b81b6020808301918252835180850190945260048452630444545560e41b9084015281519192916200008191600091620000d3565b50805162000097906001906020840190620000d3565b5050600680546001600160a01b0319166001600160a01b038516179055508051620000ca906007906020840190620000d3565b505050620002c5565b828054620000e19062000272565b90600052602060002090601f01602090048101928262000105576000855562000150565b82601f106200012057805160ff191683800117855562000150565b8280016001018555821562000150579182015b828111156200015057825182559160200191906001019062000133565b506200015e92915062000162565b5090565b5b808211156200015e576000815560010162000163565b600080604083850312156200018c578182fd5b82516001600160a01b0381168114620001a3578283fd5b602084810151919350906001600160401b0380821115620001c2578384fd5b818601915086601f830112620001d6578384fd5b815181811115620001eb57620001eb620002af565b604051601f8201601f19908116603f01168101908382118183101715620002165762000216620002af565b8160405282815289868487010111156200022e578687fd5b8693505b8284101562000251578484018601518185018701529285019262000232565b828411156200026257868684830101525b8096505050505050509250929050565b600181811c908216806200028757607f821691505b60208210811415620002a957634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052604160045260246000fd5b6121e080620002d56000396000f3fe608060405234801561001057600080fd5b50600436106101825760003560e01c8063991a73e5116100d8578063b48793d01161008c578063e026285511610066578063e026285514610384578063e11ead0a14610397578063e985e9c5146103c057610182565b8063b48793d014610343578063b88d4fde1461035e578063c87b56dd1461037157610182565b8063a94e834b116100bd578063a94e834b146102e9578063a9543033146102fc578063b260c42a1461033057610182565b8063991a73e5146102c3578063a22cb465146102d657610182565b806342842e0e1161013a57806370a082311161011457806370a08231146102505780638bfecb851461027157806395d89b41146102bb57610182565b806342842e0e1461021757806342966c681461022a5780636352211e1461023d57610182565b8063081812fc1161016b578063081812fc146101c4578063095ea7b3146101ef57806323b872dd1461020457610182565b806301ffc9a71461018757806306fdde03146101af575b600080fd5b61019a610195366004611e2c565b6103fc565b60405190151581526020015b60405180910390f35b6101b76104e3565b6040516101a69190611f31565b6101d76101d2366004611e64565b610575565b6040516001600160a01b0390911681526020016101a6565b6102026101fd366004611de7565b610620565b005b610202610212366004611c83565b610752565b610202610225366004611c83565b6107d9565b610202610238366004611e64565b6107f4565b6101d761024b366004611e64565b6109f5565b61026361025e366004611c37565b610a80565b6040519081526020016101a6565b61028461027f366004611e64565b610b1a565b6040805163ffffffff968716815294861660208601529285169284019290925283166060830152909116608082015260a0016101a6565b6101b7610b78565b6006546101d7906001600160a01b031681565b6102026102e4366004611db1565b610b87565b6102636102f7366004611e64565b610c77565b61031061030a366004611e64565b60881c90565b6040516effffffffffffffffffffffffffffff90911681526020016101a6565b61020261033e366004611e64565b610d67565b600854610310906effffffffffffffffffffffffffffff1681565b61020261036c366004611cbe565b610e61565b6101b761037f366004611e64565b610eef565b610263610392366004611e64565b610fd8565b6101d76103a5366004611e64565b6009602052600090815260409020546001600160a01b031681565b61019a6103ce366004611c51565b6001600160a01b03918216600090815260056020908152604080832093909416825291909152205460ff1690565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f80ac58cd00000000000000000000000000000000000000000000000000000000148061048f57507fffffffff0000000000000000000000000000000000000000000000000000000082167f5b5e139f00000000000000000000000000000000000000000000000000000000145b806104db57507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b90505b919050565b6060600080546104f29061203d565b80601f016020809104026020016040519081016040528092919081815260200182805461051e9061203d565b801561056b5780601f106105405761010080835404028352916020019161056b565b820191906000526020600020905b81548152906001019060200180831161054e57829003601f168201915b5050505050905090565b6000818152600260205260408120546001600160a01b03166106045760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084015b60405180910390fd5b506000908152600460205260409020546001600160a01b031690565b600061062b826109f5565b9050806001600160a01b0316836001600160a01b031614156106b55760405162461bcd60e51b815260206004820152602160248201527f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560448201527f720000000000000000000000000000000000000000000000000000000000000060648201526084016105fb565b336001600160a01b03821614806106d157506106d181336103ce565b6107435760405162461bcd60e51b815260206004820152603860248201527f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760448201527f6e6572206e6f7220617070726f76656420666f7220616c6c000000000000000060648201526084016105fb565b61074d8383611125565b505050565b61075c33826111ab565b6107ce5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016105fb565b61074d8383836112b3565b61074d83838360405180602001604052806000815250610e61565b6000818152600960205260409020546001600160a01b031633141561084c57600081815260096020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055610903565b6000818152600260205260409020546001600160a01b031615158015610882575033610877826109f5565b6001600160a01b0316145b156108955761089081611498565b610903565b60405162461bcd60e51b815260206004820152602b60248201527f746869732067656d20646f6573206e6f74206578697374206f7220796f75206460448201527f6f6e2774206f776e20697400000000000000000000000000000000000000000060648201526084016105fb565b6006546001600160a01b031663a9059cbb3361091e8461154b565b6040517fffffffff0000000000000000000000000000000000000000000000000000000060e085901b1681526001600160a01b0390921660048301526fffffffffffffffffffffffffffffffff166024820152604401602060405180830381600087803b15801561098e57600080fd5b505af11580156109a2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109c69190611e10565b5060405181907fd83c63197e8e676d80ab0122beba9a9d20f3828839e9a1d6fe81d242e9cd7e6e90600090a250565b6000818152600260205260408120546001600160a01b0316806104db5760405162461bcd60e51b815260206004820152602960248201527f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460448201527f656e7420746f6b656e000000000000000000000000000000000000000000000060648201526084016105fb565b60006001600160a01b038216610afe5760405162461bcd60e51b815260206004820152602a60248201527f4552433732313a2062616c616e636520717565727920666f7220746865207a6560448201527f726f20616464726573730000000000000000000000000000000000000000000060648201526084016105fb565b506001600160a01b031660009081526003602052604090205490565b600080808080608086901c8682610b39670de0b6b3a764000083611f86565b606084901c63ffffffff169a604085901c67ffffffffffffffff169a50602085901c6bffffffffffffffffffffffff1699509397509550919350505050565b6060600180546104f29061203d565b6001600160a01b038216331415610be05760405162461bcd60e51b815260206004820152601960248201527f4552433732313a20617070726f766520746f2063616c6c65720000000000000060448201526064016105fb565b3360008181526005602090815260408083206001600160a01b038716808552925290912080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016841515179055906001600160a01b03167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051610c6b911515815260200190565b60405180910390a35050565b6006546040517ffe9b9ad5000000000000000000000000000000000000000000000000000000008152336004820152602481018390526000916001600160a01b03169063fe9b9ad590604401600060405180830381600087803b158015610cdd57600080fd5b505af1158015610cf1573d6000803e3d6000fd5b505050506000610d0083611566565b60008181526009602052604080822080547fffffffffffffffffffffffff000000000000000000000000000000000000000016331790555191925082917fa22a31dd1a00f78bee760c51c0ef685aca8f4bec18943fe176e64d80379cc15e9190a292915050565b6000818152600960205260409020546001600160a01b03163314610df5576040805162461bcd60e51b81526020600482015260248101919091527f67656d20697320616c7265616479206163746976617465642c20796f7520646f60448201527f6e2774206f776e2069742c206f7220697420646f6573206e6f7420657869737460648201526084016105fb565b600081815260096020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055610e3333826116b4565b60405181907f3ec796be1be7d03bff3a62b9fa594a60e947c1809bced06d929f145308ae57ce90600090a250565b610e6b33836111ab565b610edd5760405162461bcd60e51b815260206004820152603160248201527f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60448201527f776e6572206e6f7220617070726f76656400000000000000000000000000000060648201526084016105fb565b610ee98484848461180e565b50505050565b6000818152600260205260409020546060906001600160a01b0316610f7c5760405162461bcd60e51b815260206004820152602f60248201527f4552433732314d657461646174613a2055524920717565727920666f72206e6f60448201527f6e6578697374656e7420746f6b656e000000000000000000000000000000000060648201526084016105fb565b6000610f86611897565b90506000815111610fa65760405180602001604052806000815250610fd1565b80610fb0846118a6565b604051602001610fc1929190611ec6565b6040516020818303038152906040525b9392505050565b6000818152600960205260408120546001600160a01b03163314611066576040805162461bcd60e51b81526020600482015260248101919091527f67656d20697320616c7265616479206163746976617465642c20796f7520646f60448201527f6e2774206f776e2069742c206f7220697420646f6573206e6f7420657869737460648201526084016105fb565b600082815260096020526040812080547fffffffffffffffffffffffff00000000000000000000000000000000000000001690556110bd6110a68461154b565b6fffffffffffffffffffffffffffffffff16611566565b60008181526009602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000163317905551919250829185917f0ac50292890370017bcbe7f41421fb0c343be2b92f45e7538af33f84fdb4ee7991a392915050565b600081815260046020526040902080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0384169081179091558190611172826109f5565b6001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000818152600260205260408120546001600160a01b03166112355760405162461bcd60e51b815260206004820152602c60248201527f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860448201527f697374656e7420746f6b656e000000000000000000000000000000000000000060648201526084016105fb565b6000611240836109f5565b9050806001600160a01b0316846001600160a01b0316148061127b5750836001600160a01b031661127084610575565b6001600160a01b0316145b806112ab57506001600160a01b0380821660009081526005602090815260408083209388168352929052205460ff165b949350505050565b826001600160a01b03166112c6826109f5565b6001600160a01b0316146113425760405162461bcd60e51b815260206004820152602960248201527f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960448201527f73206e6f74206f776e000000000000000000000000000000000000000000000060648201526084016105fb565b6001600160a01b0382166113bd5760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f2061646460448201527f726573730000000000000000000000000000000000000000000000000000000060648201526084016105fb565b6113c8600082611125565b6001600160a01b03831660009081526003602052604081208054600192906113f1908490611ffa565b90915550506001600160a01b038216600090815260036020526040812080546001929061141f908490611f6e565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0386811691821790925591518493918716917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4505050565b60006114a3826109f5565b90506114b0600083611125565b6001600160a01b03811660009081526003602052604081208054600192906114d9908490611ffa565b909155505060008281526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055518391906001600160a01b038416907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908390a45050565b6000818161155a601483611f86565b90506112ab8183611fc9565b600067016345785d8a000082116115e55760405162461bcd60e51b815260206004820152602960248201527f67656d73206d75737420626520666f726765642077697468206174206c65617360448201527f7420302e3120505349000000000000000000000000000000000000000000000060648201526084016105fb565b600854611604906effffffffffffffffffffffffffffff166001611f44565b600880547fffffffffffffffffffffffffffffffffff000000000000000000000000000000166effffffffffffffffffffffffffffff929092169182179055600090610fd19061167590611656611a27565b60ff1660089190911b6fffffffffffffffffffffffffffffff00161790565b846fffffffffffffffffffffffffffffffff1660809190911b7fffffffffffffffffffffffffffffffff00000000000000000000000000000000161790565b6001600160a01b03821661170a5760405162461bcd60e51b815260206004820181905260248201527f4552433732313a206d696e7420746f20746865207a65726f206164647265737360448201526064016105fb565b6000818152600260205260409020546001600160a01b03161561176f5760405162461bcd60e51b815260206004820152601c60248201527f4552433732313a20746f6b656e20616c7265616479206d696e7465640000000060448201526064016105fb565b6001600160a01b0382166000908152600360205260408120805460019290611798908490611f6e565b909155505060008181526002602052604080822080547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b03861690811790915590518392907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef908290a45050565b6118198484846112b3565b61182584848484611a55565b610ee95760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016105fb565b6060600780546104f29061203d565b6060816118e7575060408051808201909152600181527f300000000000000000000000000000000000000000000000000000000000000060208201526104de565b8160005b811561191157806118fb81612091565b915061190a9050600a83611fb5565b91506118eb565b60008167ffffffffffffffff811115611953577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f19166020018201604052801561197d576020820181803683370190505b5090505b84156112ab57611992600183611ffa565b915061199f600a866120ca565b6119aa906030611f6e565b60f81b8183815181106119e6577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350611a20600a86611fb5565b9450611981565b60006004611a3660ff43611ffa565b4060ff16901c6004611a49600143611ffa565b4060ff16901b17919050565b60006001600160a01b0384163b15611c15576040517f150b7a020000000000000000000000000000000000000000000000000000000081526001600160a01b0385169063150b7a0290611ab2903390899088908890600401611ef5565b602060405180830381600087803b158015611acc57600080fd5b505af1925050508015611b1a575060408051601f3d9081017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0168201909252611b1791810190611e48565b60015b611bca573d808015611b48576040519150601f19603f3d011682016040523d82523d6000602084013e611b4d565b606091505b508051611bc25760405162461bcd60e51b815260206004820152603260248201527f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560448201527f63656976657220696d706c656d656e746572000000000000000000000000000060648201526084016105fb565b805181602001fd5b7fffffffff00000000000000000000000000000000000000000000000000000000167f150b7a02000000000000000000000000000000000000000000000000000000001490506112ab565b506001949350505050565b80356001600160a01b03811681146104de57600080fd5b600060208284031215611c48578081fd5b610fd182611c20565b60008060408385031215611c63578081fd5b611c6c83611c20565b9150611c7a60208401611c20565b90509250929050565b600080600060608486031215611c97578081fd5b611ca084611c20565b9250611cae60208501611c20565b9150604084013590509250925092565b60008060008060808587031215611cd3578081fd5b611cdc85611c20565b9350611cea60208601611c20565b925060408501359150606085013567ffffffffffffffff80821115611d0d578283fd5b818701915087601f830112611d20578283fd5b813581811115611d3257611d3261213c565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0908116603f01168101908382118183101715611d7857611d7861213c565b816040528281528a6020848701011115611d90578586fd5b82602086016020830137918201602001949094529598949750929550505050565b60008060408385031215611dc3578182fd5b611dcc83611c20565b91506020830135611ddc8161216b565b809150509250929050565b60008060408385031215611df9578182fd5b611e0283611c20565b946020939093013593505050565b600060208284031215611e21578081fd5b8151610fd18161216b565b600060208284031215611e3d578081fd5b8135610fd18161217c565b600060208284031215611e59578081fd5b8151610fd18161217c565b600060208284031215611e75578081fd5b5035919050565b60008151808452611e94816020860160208601612011565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b60008351611ed8818460208801612011565b835190830190611eec818360208801612011565b01949350505050565b60006001600160a01b03808716835280861660208401525083604083015260806060830152611f276080830184611e7c565b9695505050505050565b600060208252610fd16020830184611e7c565b60006effffffffffffffffffffffffffffff808316818516808303821115611eec57611eec6120de565b60008219821115611f8157611f816120de565b500190565b60006fffffffffffffffffffffffffffffffff80841680611fa957611fa961210d565b92169190910492915050565b600082611fc457611fc461210d565b500490565b60006fffffffffffffffffffffffffffffffff83811690831681811015611ff257611ff26120de565b039392505050565b60008282101561200c5761200c6120de565b500390565b60005b8381101561202c578181015183820152602001612014565b83811115610ee95750506000910152565b600181811c9082168061205157607f821691505b6020821081141561208b577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156120c3576120c36120de565b5060010190565b6000826120d9576120d961210d565b500690565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b801515811461217957600080fd5b50565b7fffffffff000000000000000000000000000000000000000000000000000000008116811461217957600080fdfea2646970667358221220043bc0fa1382573103015078f757822d75a8c4ab5cce5aaf50d14a3b3d6b937564736f6c63430008030033";
