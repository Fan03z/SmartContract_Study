export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  goerli: {
    blockConfirmations: 6,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

// Governor Values
export const QUORUM_PERCENTAGE = 4; // 需要4%的投票权才能通过
export const MIN_DELAY = 3600; // 1 hour - 提案通过后,一个小时后执行
// export const VOTING_PERIOD = 45818 // 1 week - how long the vote lasts. This is pretty long even for local tests
export const VOTING_PERIOD = 5; // blocks
export const VOTING_DELAY = 1; // 1 Block - 投票发起后,1个区块后才能投票
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const NEW_STORE_VALUE = 77;
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1 77 in the Box!";
