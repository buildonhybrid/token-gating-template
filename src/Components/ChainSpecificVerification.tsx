import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { ChainType } from './AppConfig';

// ERC20 ABI for Ethereum-compatible chains
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

  // Direct ethers call for balance (since wagmi is failing)
  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress && address) {
      const getDirectBalance = async () => {
        try {
          // Use appropriate RPC for each chain
          let rpcUrl = 'https://base-mainnet.public.blastapi.io'; // default
          if (chainType === 'ethereum') {
            rpcUrl = 'https://rpc.ankr.com/eth';
          } else if (chainType === 'polygon') {
            rpcUrl = 'https://rpc.ankr.com/polygon';
          } else if (chainType === 'arbitrum') {
            rpcUrl = 'https://rpc.ankr.com/arbitrum';
          } else if (chainType === 'optimism') {
            rpcUrl = 'https://rpc.ankr.com/optimism';
          } else if (chainType === 'goerli') {
            rpcUrl = 'https://rpc.ankr.com/eth_goerli';
          } else if (chainType === 'sepolia') {
            rpcUrl = 'https://rpc.ankr.com/eth_sepolia';
          } else if (chainType === 'polygonMumbai') {
            rpcUrl = 'https://rpc.ankr.com/polygon_mumbai';
          } else if (chainType === 'optimismGoerli') {
            rpcUrl = 'https://rpc.ankr.com/optimism_testnet';
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

  // Direct ethers call for symbol
  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress) {
      const getDirectSymbol = async () => {
        try {
          // Use appropriate RPC for each chain
          let rpcUrl = 'https://base-mainnet.public.blastapi.io'; // default
          if (chainType === 'ethereum') {
            rpcUrl = 'https://rpc.ankr.com/eth';
          } else if (chainType === 'polygon') {
            rpcUrl = 'https://rpc.ankr.com/polygon';
          } else if (chainType === 'arbitrum') {
            rpcUrl = 'https://rpc.ankr.com/arbitrum';
          } else if (chainType === 'optimism') {
            rpcUrl = 'https://rpc.ankr.com/optimism';
          } else if (chainType === 'goerli') {
            rpcUrl = 'https://rpc.ankr.com/eth_goerli';
          } else if (chainType === 'sepolia') {
            rpcUrl = 'https://rpc.ankr.com/eth_sepolia';
          } else if (chainType === 'polygonMumbai') {
            rpcUrl = 'https://rpc.ankr.com/polygon_mumbai';
          } else if (chainType === 'optimismGoerli') {
            rpcUrl = 'https://rpc.ankr.com/optimism_testnet';
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const symbol = await contract.symbol();
          setTokenSymbol(symbol);
          console.log('Direct ethers symbol:', symbol);
        } catch (error) {
          console.error('Direct ethers symbol error:', error);
          setTokenSymbol(tokenName); // Use provided token name as fallback
        }
      };
      getDirectSymbol();
    }
  }, [chainType, tokenAddress, tokenName]);

  // Direct ethers call for decimals
  useEffect(() => {
    if (chainType !== 'solana' && tokenAddress) {
      const getDirectDecimals = async () => {
        try {
          // Use appropriate RPC for each chain
          let rpcUrl = 'https://base-mainnet.public.blastapi.io'; // default
          if (chainType === 'ethereum') {
            rpcUrl = 'https://rpc.ankr.com/eth';
          } else if (chainType === 'polygon') {
            rpcUrl = 'https://rpc.ankr.com/polygon';
          } else if (chainType === 'arbitrum') {
            rpcUrl = 'https://rpc.ankr.com/arbitrum';
          } else if (chainType === 'optimism') {
            rpcUrl = 'https://rpc.ankr.com/optimism';
          } else if (chainType === 'goerli') {
            rpcUrl = 'https://rpc.ankr.com/eth_goerli';
          } else if (chainType === 'sepolia') {
            rpcUrl = 'https://rpc.ankr.com/eth_sepolia';
          } else if (chainType === 'polygonMumbai') {
            rpcUrl = 'https://rpc.ankr.com/polygon_mumbai';
          } else if (chainType === 'optimismGoerli') {
            rpcUrl = 'https://rpc.ankr.com/optimism_testnet';
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const decimals = await contract.decimals();
          setTokenDecimals(decimals);
          console.log('Direct ethers decimals:', decimals);
        } catch (error) {
          console.error('Direct ethers decimals error:', error);
          setTokenDecimals(18); // Fallback
        }
      };
      getDirectDecimals();
    }
  }, [chainType, tokenAddress]);

  // Check if user is on the correct network
  const isOnCorrectNetwork = () => {
    if (chainType === 'base') {
      return chain?.id === 8453; // Base mainnet
    }
    if (chainType === 'ethereum') {
      return chain?.id === 1; // Ethereum mainnet
    }
    if (chainType === 'polygon') {
      return chain?.id === 137; // Polygon mainnet
    }
    if (chainType === 'arbitrum') {
      return chain?.id === 42161; // Arbitrum mainnet
    }
    if (chainType === 'goerli') {
      return chain?.id === 5; // Goerli testnet
    }
    if (chainType === 'sepolia') {
      return chain?.id === 11155111; // Sepolia testnet
    }
    if (chainType === 'polygonMumbai') {
      return chain?.id === 80001; // Polygon Mumbai testnet
    }
    if (chainType === 'optimism') {
      return chain?.id === 10; // Optimism mainnet
    }
    if (chainType === 'optimismGoerli') {
      return chain?.id === 420; // Optimism Goerli testnet
    }
    if (chainType === 'solana') {
      // Solana uses a different chain ID system
      return true; // We'll handle Solana separately
    }
    return false; // Unsupported chain
  };

  const handleSwitchNetwork = () => {
    if (chainType === 'base' && switchNetwork) {
      switchNetwork(8453);
    } else if (chainType === 'ethereum' && switchNetwork) {
      switchNetwork(1);
    } else if (chainType === 'polygon' && switchNetwork) {
      switchNetwork(137);
    } else if (chainType === 'arbitrum' && switchNetwork) {
      switchNetwork(42161);
    } else if (chainType === 'goerli' && switchNetwork) {
      switchNetwork(5);
    } else if (chainType === 'sepolia' && switchNetwork) {
      switchNetwork(11155111);
    } else if (chainType === 'polygonMumbai' && switchNetwork) {
      switchNetwork(80001);
    } else if (chainType === 'optimism' && switchNetwork) {
      switchNetwork(10);
    } else if (chainType === 'optimismGoerli' && switchNetwork) {
      switchNetwork(420);
    }
  };

  // For Ethereum-compatible chains (Ethereum, Base, Polygon, Arbitrum)
  const { data: balanceData, refetch: refetchBalance, error: balanceError } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress && chainType !== 'solana',
    onError: (error) => {
      console.error('Balance read error:', error);
    },
    onSuccess: (data) => {
      console.log('Balance read success:', data);
    },
    chainId: chainType === 'base' ? 8453 : chainType === 'ethereum' ? 1 : chainType === 'polygon' ? 137 : chainType === 'arbitrum' ? 42161 : undefined,
  });

  const { data: symbolData, error: symbolError } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress && chainType !== 'solana',
    onError: (error) => {
      console.error('Symbol read error:', error);
    },
    onSuccess: (data) => {
      console.log('Symbol read success:', data);
    },
    chainId: chainType === 'base' ? 8453 : chainType === 'ethereum' ? 1 : chainType === 'polygon' ? 137 : chainType === 'arbitrum' ? 42161 : undefined,
  });

  const { data: decimalsData, error: decimalsError } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress && chainType !== 'solana',
    onError: (error) => {
      console.error('Decimals read error:', error);
    },
    onSuccess: (data) => {
      console.log('Decimals read success:', data);
    },
    chainId: chainType === 'base' ? 8453 : chainType === 'ethereum' ? 1 : chainType === 'polygon' ? 137 : chainType === 'arbitrum' ? 42161 : undefined,
  });

  // Debug logging
  useEffect(() => {
    const debug = {
      chainType,
      tokenAddress,
      userAddress: address,
      balanceData: balanceData?.toString(),
      symbolData: symbolData?.toString(),
      decimalsData: decimalsData?.toString(),
      balanceError: balanceError?.message,
      symbolError: symbolError?.message,
      decimalsError: decimalsError?.message,
      directBalance,
      directSymbol: tokenSymbol,
      directDecimals: tokenDecimals,
    };
    setDebugInfo(JSON.stringify(debug, null, 2));
  }, [chainType, tokenAddress, address, balanceData, symbolData, decimalsData, balanceError, symbolError, decimalsError, directBalance, tokenSymbol, tokenDecimals]);

  // Handle Solana token balance (placeholder - would need @solana/web3.js)
  useEffect(() => {
    if (chainType === 'solana' && isConnected && address) {
      setError('Solana token verification requires @solana/web3.js integration. Please use Ethereum-compatible chains for now.');
      setUserBalance('0');
      setTokenSymbol('SPL');
    }
  }, [chainType, isConnected, address]);

  // Handle Ethereum-compatible chains
  useEffect(() => {
    if (directBalance && directBalance !== '0') {
      // Use direct ethers result if available
      setUserBalance(directBalance);
      console.log('Using direct balance:', directBalance);
    } else if (balanceData && chainType !== 'solana') {
      try {
        const balance = ethers.utils.formatUnits(balanceData.toString(), tokenDecimals);
        setUserBalance(balance);
        console.log('Balance formatted:', balance, 'from raw:', balanceData.toString());
      } catch (err) {
        console.error('Error formatting balance:', err);
        setError('Error formatting token balance');
      }
    } else if (balanceError) {
      console.error('Balance error:', balanceError);
      setError(`Failed to read balance: ${balanceError.message}`);
    }
  }, [balanceData, tokenDecimals, chainType, balanceError, directBalance]);

  useEffect(() => {
    if (symbolData && chainType !== 'solana') {
      setTokenSymbol(symbolData.toString());
      console.log('Token symbol:', symbolData.toString());
    } else if (symbolError) {
      console.error('Symbol error:', symbolError);
      setError(`Failed to read token symbol: ${symbolError.message}`);
    }
  }, [symbolData, chainType, symbolError]);

  useEffect(() => {
    if (decimalsData && chainType !== 'solana') {
      setTokenDecimals(Number(decimalsData));
      console.log('Token decimals:', decimalsData);
    } else if (decimalsError) {
      console.error('Decimals error:', decimalsError);
      setError(`Failed to read token decimals: ${decimalsError.message}`);
    }
  }, [decimalsData, chainType, decimalsError]);

  useEffect(() => {
    if (isConnected && address && chainType !== 'solana') {
      refetchBalance();
    }
  }, [isConnected, address, refetchBalance, chainType]);

  const hasRequiredTokens = parseFloat(userBalance) >= parseFloat(requiredAmount);

  // Auto-disconnect if verification fails
  useEffect(() => {
    if (verificationAttempted && !hasRequiredTokens && isConnected) {
      // Wait a bit to show the error message before disconnecting
      const timer = setTimeout(() => {
        disconnect();
        setVerificationAttempted(false);
      }, 3000); // 3 seconds delay

      return () => clearTimeout(timer);
    }
  }, [verificationAttempted, hasRequiredTokens, isConnected, disconnect]);

  const handleVerify = async () => {
    setIsLoading(true);
    setVerificationAttempted(true);
    try {
      if (chainType === 'solana') {
        setError('Solana verification not yet implemented');
        return;
      }
      
      await refetchBalance();
      if (hasRequiredTokens) {
        onVerificationComplete();
      } else {
        setError('Insufficient tokens. Wallet will be disconnected.');
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

  // Show network switching prompt if on wrong network
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

          {/* Debug Info */}
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
            disabled={!hasRequiredTokens || isLoading || chainType === 'solana'}
            className={`px-4 py-2 rounded ${
              hasRequiredTokens && chainType !== 'solana'
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