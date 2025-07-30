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

export const validateSolanaAddress = (address: string): boolean => {
  try {
    if (typeof window !== 'undefined' && (window as any).solana) {
      const { PublicKey } = (window as any).solanaWeb3;
      new PublicKey(address);
      return true;
    }
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

export const getSolanaTokenBalance = async (
  walletAddress: string,
  tokenMint: string
): Promise<{ balance: string; symbol: string }> => {
  try {
    if (typeof window === 'undefined' || !(window as any).solana) {
      throw new Error('Solana wallet not detected');
    }

    const solana = (window as any).solana;
    
    if (!solana.isConnected) {
      throw new Error('Solana wallet not connected');
    }

    const response = await solana.request({
      method: 'getTokenAccountsByOwner',
      params: {
        owner: walletAddress,
        mint: tokenMint,
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
      }
    });

    let totalBalance = 0;
    if (response.value && response.value.length > 0) {
      for (const account of response.value) {
        const accountInfo = await solana.request({
          method: 'getTokenAccountBalance',
          params: {
            tokenAccount: account.pubkey
          }
        });
        
        if (accountInfo.value && accountInfo.value.uiAmount) {
          totalBalance += accountInfo.value.uiAmount;
        }
      }
    }

    return {
      balance: totalBalance.toString(),
      symbol: 'SPL'
    };
  } catch (error) {
    console.error('Error getting Solana token balance:', error);
    throw error;
  }
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