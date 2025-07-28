import { ethers } from 'ethers';

// ERC20 ABI for basic token operations
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
];

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
}

export const getTokenInfo = async (
  tokenAddress: string,
  userAddress: string,
  provider: ethers.providers.Provider
): Promise<TokenInfo> => {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  
  const [symbol, name, decimals, balance] = await Promise.all([
    contract.symbol(),
    contract.name(),
    contract.decimals(),
    contract.balanceOf(userAddress)
  ]);

  const formattedBalance = ethers.utils.formatUnits(balance, decimals);

  return {
    symbol,
    name,
    decimals,
    balance: balance.toString(),
    formattedBalance
  };
};

export const checkTokenBalance = async (
  tokenAddress: string,
  userAddress: string,
  requiredAmount: string,
  provider: ethers.providers.Provider
): Promise<{ hasEnough: boolean; currentBalance: string; requiredAmount: string }> => {
  const tokenInfo = await getTokenInfo(tokenAddress, userAddress, provider);
  const hasEnough = parseFloat(tokenInfo.formattedBalance) >= parseFloat(requiredAmount);
  
  return {
    hasEnough,
    currentBalance: tokenInfo.formattedBalance,
    requiredAmount
  };
}; 