import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { ChainType, getChainId, getRpcUrl } from './AppConfig';

const ERC20_ABI = [
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

interface ChainSpecificVerificationProps {
  chainType: ChainType;
  tokenAddress: string;
  requiredAmount: string;
  tokenName?: string;
  onVerificationComplete: () => void;
  onClose: () => void;
}

const ChainSpecificVerification: React.FC<ChainSpecificVerificationProps> = ({
  chainType,
  tokenAddress,
  requiredAmount,
  tokenName = "Token",
  onVerificationComplete,
  onClose
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [userBalance, setUserBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [verificationAttempted, setVerificationAttempted] = useState<boolean>(false);
  const [directBalance, setDirectBalance] = useState<string>('0');

  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress && address) {
      const getDirectBalance = async () => {
        try {
          const rpcUrl = getRpcUrl(chainType);
          if (!rpcUrl) {
            console.error('No RPC URL found for chain:', chainType);
            return;
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(address);
          const formattedBalance = ethers.utils.formatUnits(balance, tokenDecimals);
          setDirectBalance(formattedBalance);
          setUserBalance(formattedBalance);
          console.log('Direct ethers balance:', formattedBalance);
        } catch (error) {
          console.error('Direct ethers call error:', error);
        }
      };
      getDirectBalance();
    }
  }, [chainType, tokenAddress, address, tokenDecimals]);

  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress) {
      const getDirectSymbol = async () => {
        try {
          const rpcUrl = getRpcUrl(chainType);
          if (!rpcUrl) {
            console.error('No RPC URL found for chain:', chainType);
            return;
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const symbol = await contract.symbol();
          setTokenSymbol(symbol);
          console.log('Direct ethers symbol:', symbol);
        } catch (error) {
          console.error('Direct ethers symbol error:', error);
          setTokenSymbol(tokenName);
        }
      };
      getDirectSymbol();
    }
  }, [chainType, tokenAddress, tokenName]);

  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress) {
      const getDirectDecimals = async () => {
        try {
          const rpcUrl = getRpcUrl(chainType);
          if (!rpcUrl) {
            console.error('No RPC URL found for chain:', chainType);
            return;
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const decimals = await contract.decimals();
          setTokenDecimals(decimals);
          console.log('Direct ethers decimals:', decimals);
        } catch (error) {
          console.error('Direct ethers decimals error:', error);
          setTokenDecimals(18);
        }
      };
      getDirectDecimals();
    }
  }, [chainType, tokenAddress]);

  const isOnCorrectNetwork = () => {
    if (chainType === 'solana') {
      return true;
    }
    const expectedChainId = getChainId(chainType);
    return chain?.id === expectedChainId;
  };

  const handleSwitchNetwork = () => {
    const chainId = getChainId(chainType);
    if (chainId && switchNetwork) {
      switchNetwork(chainId);
    }
  };

  const { data: balanceData, refetch: refetchBalance } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress && chainType !== 'solana',
  });

  const { data: symbolData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress && chainType !== 'solana',
  });

  const { data: decimalsData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress && chainType !== 'solana',
  });

  const checkSolanaBalance = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      if (typeof window !== 'undefined' && (window as any).solana) {
        const solana = (window as any).solana;
        
        if (!solana.isConnected) {
          setError('Please connect your Solana wallet first.');
          return;
        }

        const response = await solana.request({
          method: 'getTokenAccountsByOwner',
          params: {
            owner: address,
            mint: tokenAddress,
            programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
          }
        });

        if (response.value && response.value.length > 0) {
          let totalBalance = 0;
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
          
          setUserBalance(totalBalance.toString());
          setTokenSymbol(tokenName);
          setDebugInfo(`Solana balance: ${totalBalance} ${tokenName}`);
        } else {
          setUserBalance('0');
          setTokenSymbol(tokenName);
          setDebugInfo('No Solana token accounts found');
        }
      } else {
        setError('Solana wallet not detected. Please install a Solana wallet extension like Phantom or Solflare.');
      }
    } catch (error) {
      console.error('Solana balance check error:', error);
      setError('Failed to check Solana token balance. Please ensure your wallet is connected and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chainType === 'solana' && isConnected && address) {
      checkSolanaBalance();
    } else if (balanceData && chainType !== 'solana') {
      const balance = ethers.utils.formatUnits(balanceData.toString(), tokenDecimals);
      setUserBalance(balance);
      setDebugInfo(`Ethereum balance: ${balance} ${tokenSymbol}`);
    }
  }, [chainType, balanceData, tokenDecimals, tokenSymbol, address, isConnected, tokenAddress, tokenName]);

  useEffect(() => {
    if (symbolData && chainType !== 'solana') {
      setTokenSymbol(symbolData.toString());
    }
  }, [symbolData, chainType]);

  useEffect(() => {
    if (decimalsData && chainType !== 'solana') {
      setTokenDecimals(Number(decimalsData));
    }
  }, [decimalsData, chainType]);

  useEffect(() => {
    if (isConnected && address && chainType !== 'solana') {
      setDebugInfo(`Connected: ${address}\nChain: ${chainType}\nToken: ${tokenAddress}`);
    }
  }, [isConnected, address, chainType, tokenAddress]);

  const hasRequiredTokens = parseFloat(userBalance) >= parseFloat(requiredAmount);

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setVerificationAttempted(true);
      setError('');
      
      if (chainType === 'solana') {
        await checkSolanaBalance();
        if (hasRequiredTokens) {
          onVerificationComplete();
        } else {
          setError('Insufficient Solana tokens. Wallet will be disconnected.');
          setTimeout(() => {
            disconnect();
          }, 3000);
        }
        return;
      }
      
      await refetchBalance();
      if (hasRequiredTokens) {
        onVerificationComplete();
      } else {
        setError('Insufficient tokens. Wallet will be disconnected.');
        setTimeout(() => {
          disconnect();
        }, 3000);
      }
    } catch (error) {
      console.error('Error verifying tokens:', error);
      setError('Failed to verify token balance');
    } finally {
      setIsLoading(false);
    }
  };

  const getChainDisplayName = (chain: ChainType) => {
    const chainNames = {
      ethereum: 'Ethereum',
      base: 'Base',
      polygon: 'Polygon',
      arbitrum: 'Arbitrum',
      optimism: 'Optimism',
      goerli: 'Goerli',
      sepolia: 'Sepolia',
      polygonMumbai: 'Polygon Mumbai',
      optimismGoerli: 'Optimism Goerli',
      arbitrumSepolia: 'Arbitrum Sepolia',
      baseSepolia: 'Base Sepolia',
      solana: 'Solana'
    };
    return chainNames[chain] || chain;
  };

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-zinc-800 rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to verify token holdings on {getChainDisplayName(chainType)}.
          </p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOnCorrectNetwork()) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-zinc-800 rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Switch Network</h2>
          <p className="text-gray-300 mb-6">
            You need to switch to {getChainDisplayName(chainType)} network to verify your token holdings.
            <br />
            <span className="text-sm text-yellow-400">
              Current network: {chain?.name || 'Unknown'} (ID: {chain?.id})
            </span>
          </p>
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSwitchNetwork}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Switch to {getChainDisplayName(chainType)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-4">
          Token Verification Required ({getChainDisplayName(chainType)})
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            You need to hold at least <span className="font-bold text-white">{requiredAmount}</span> {tokenSymbol || tokenName} tokens on {getChainDisplayName(chainType)} to continue.
          </p>
          
          <div className="bg-zinc-700 rounded p-4 mb-4">
            <p className="text-sm text-gray-400">Token Address:</p>
            <p className="text-xs text-gray-300 break-all">{tokenAddress}</p>
          </div>

          <div className="bg-zinc-700 rounded p-4">
            <p className="text-sm text-gray-400">Your Balance:</p>
            <p className={`text-lg font-bold ${hasRequiredTokens ? 'text-green-400' : 'text-red-400'}`}>
              {userBalance} {tokenSymbol || tokenName}
            </p>
          </div>

          <details className="mt-4">
            <summary className="text-xs text-gray-400 cursor-pointer">Debug Info</summary>
            <pre className="text-xs text-gray-500 mt-2 bg-zinc-900 p-2 rounded overflow-auto">
              {debugInfo}
            </pre>
          </details>
        </div>

        {hasRequiredTokens ? (
          <div className="text-green-400 mb-4">
            ✅ You have sufficient tokens!
          </div>
        ) : (
          <div className="text-red-400 mb-4">
            ❌ Insufficient tokens. Please acquire more {tokenSymbol || tokenName} tokens on {getChainDisplayName(chainType)}.
            {verificationAttempted && (
              <div className="text-yellow-400 text-sm mt-2">
                ⏰ Wallet will be disconnected in 3 seconds...
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
          
          <button
            onClick={handleVerify}
            disabled={!hasRequiredTokens || isLoading}
            className={`px-4 py-2 rounded ${
              hasRequiredTokens
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Verifying...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChainSpecificVerification; 