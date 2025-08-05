import { ethers } from 'ethers';

export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
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
  
  const [symbol, decimals, balance] = await Promise.all([
    contract.symbol(),
    contract.decimals(),
    contract.balanceOf(userAddress)
  ]);

  const formattedBalance = ethers.utils.formatUnits(balance, decimals);

  return {
    symbol,
    name: symbol,
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

export const formatTokenBalance = (balance: string, decimals: number): string => {
  try {
    return ethers.utils.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error formatting token balance:', error);
    return '0';
  }
};

export const parseTokenBalance = (balance: string, decimals: number): string => {
  try {
    return ethers.utils.parseUnits(balance, decimals).toString();
  } catch (error) {
    console.error('Error parsing token balance:', error);
    return '0';
  }
};

export const validateEthereumAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};

export const getEthereumTokenBalance = async (
  walletAddress: string,
  tokenAddress: string,
  rpcUrl: string
): Promise<{ balance: string; symbol: string; decimals: number }> => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const [balance, symbol, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.symbol(),
      contract.decimals()
    ]);

    return {
      balance: ethers.utils.formatUnits(balance, decimals),
      symbol,
      decimals
    };
  } catch (error) {
    console.error('Error getting Ethereum token balance:', error);
    throw error;
  }
}; 