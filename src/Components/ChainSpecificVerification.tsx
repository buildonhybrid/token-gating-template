import React, { useState, useEffect, useCallback } from 'react';
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
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [verificationAttempted, setVerificationAttempted] = useState<boolean>(false);
  const [directBalance, setDirectBalance] = useState<string>('0');
  const [isValidContract, setIsValidContract] = useState<boolean>(true);

  useEffect(() => {
    if (isConnected && address) {
      setIsInitializing(true);
      const timer = setTimeout(() => {
        setIsInitializing(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsInitializing(false);
    }
  }, [isConnected, address]);

  const validateContractAddress = useCallback(async (address: string, chainType: ChainType) => {
    try {
      const rpcUrl = getRpcUrl(chainType);
      if (!rpcUrl) return false;
      
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      
      // Test the RPC connection first
      try {
        const chainId = await provider.getNetwork();
        console.log(`Connected to chain ID: ${chainId.chainId}`);
      } catch (error) {
        console.error('RPC connection test failed:', error);
        return false;
      }
      
      const code = await provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      console.error('Contract validation error:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && tokenAddress) {
      validateContractAddress(tokenAddress, chainType).then(setIsValidContract);
    }
  }, [tokenAddress, chainType, isInitializing, validateContractAddress]);

  useEffect(() => {
    if (!isInitializing && tokenAddress && address && isValidContract) {
      const getDirectBalance = async () => {
        try {
          setIsBalanceLoading(true);
          setError(''); // Clear any previous errors
          
          const rpcUrl = getRpcUrl(chainType);
          if (!rpcUrl) {
            console.error('No RPC URL found for chain:', chainType);
            return;
          }
          
          const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
          
          // Test RPC connection
          try {
            const network = await provider.getNetwork();
            console.log(`Connected to network: ${network.chainId}`);
          } catch (error) {
            console.error('RPC connection failed:', error);
            return;
          }
          
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(address);
          const formattedBalance = ethers.utils.formatUnits(balance, tokenDecimals);
          setDirectBalance(formattedBalance);
          setUserBalance(formattedBalance);
          console.log('Balance fetched:', formattedBalance);
          
        } catch (error) {
          console.error('Direct ethers call error:', error);
          // Only set error if it's a persistent failure, not a temporary one
          if (error instanceof Error && error.message.includes('CALL_EXCEPTION')) {
            setError('Invalid token contract. Please check the token address.');
          }
        } finally {
          setIsBalanceLoading(false);
        }
      };
      getDirectBalance();
    }
  }, [chainType, tokenAddress, address, tokenDecimals, isInitializing, isValidContract]);

  useEffect(() => {
    if (!isInitializing && tokenAddress && isValidContract) {
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
  }, [chainType, tokenAddress, tokenName, isInitializing, isValidContract]);

  useEffect(() => {
    if (!isInitializing && tokenAddress && isValidContract) {
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
  }, [chainType, tokenAddress, isInitializing, isValidContract]);

  const isOnCorrectNetwork = () => {
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
    enabled: !!address && !!tokenAddress && !isInitializing && isValidContract,
  });

  const { data: symbolData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress && !isInitializing && isValidContract,
  });

  const { data: decimalsData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress && !isInitializing && isValidContract,
  });

  useEffect(() => {
    if (!isInitializing && balanceData && isValidContract) {
      try {
        const balance = ethers.utils.formatUnits(balanceData.toString(), tokenDecimals);
        setUserBalance(balance);
        setDebugInfo(`Ethereum balance: ${balance} ${tokenSymbol}`);
      } catch (error) {
        console.error('Balance formatting error:', error);
        setUserBalance('0');
      }
    }
  }, [balanceData, tokenDecimals, tokenSymbol, address, isConnected, tokenAddress, tokenName, isInitializing, isValidContract]);

  useEffect(() => {
    if (!isInitializing && symbolData && isValidContract) {
      setTokenSymbol(symbolData.toString());
    }
  }, [symbolData, isInitializing, isValidContract]);

  useEffect(() => {
    if (!isInitializing && decimalsData && isValidContract) {
      setTokenDecimals(Number(decimalsData));
    }
  }, [decimalsData, isInitializing, isValidContract]);

  useEffect(() => {
    if (!isInitializing && isConnected && address) {
      setDebugInfo(`Connected: ${address}\nChain: ${chainType}\nToken: ${tokenAddress}`);
    }
  }, [isConnected, address, chainType, tokenAddress, isInitializing]);

  const hasRequiredTokens = !isBalanceLoading && parseFloat(userBalance) >= parseFloat(requiredAmount);

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setVerificationAttempted(true);
      setError('');
      
      // Don't block verification if contract validation failed, let it try anyway
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
      baseSepolia: 'Base Sepolia'
    };
    return chainNames[chain] || chain;
  };

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Connect Wallet
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please connect your wallet to verify token holdings on {getChainDisplayName(chainType)}.
              </p>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOnCorrectNetwork()) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Switch Network
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Network Mismatch
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You need to switch to {getChainDisplayName(chainType)} network to verify your token holdings.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Network</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {chain?.name || 'Unknown'} (ID: {chain?.id})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitchNetwork}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-sm"
              >
                Switch to {getChainDisplayName(chainType)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Token Verification ({getChainDisplayName(chainType)})
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="animate-spin w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Initializing...
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please wait while we prepare to verify your token holdings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Token Verification ({getChainDisplayName(chainType)})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isBalanceLoading 
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : hasRequiredTokens 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {isBalanceLoading ? (
                  <svg className="animate-spin w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : hasRequiredTokens ? (
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isBalanceLoading 
                  ? 'Fetching Balance...' 
                  : hasRequiredTokens 
                    ? 'Verification Successful' 
                    : 'Verification Required'
                }
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {isBalanceLoading 
                  ? 'Please wait while we fetch your token balance...'
                  : (
                    <>
                      You need to hold at least <span className="font-semibold text-gray-900 dark:text-white">{requiredAmount}</span> {tokenSymbol || tokenName} tokens on {getChainDisplayName(chainType)} to continue.
                    </>
                  )
                }
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Token Address</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono break-all">{tokenAddress}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Your Balance</span>
                  <span className={`text-lg font-semibold ${
                    isBalanceLoading 
                      ? 'text-gray-500 dark:text-gray-400'
                      : hasRequiredTokens 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isBalanceLoading 
                      ? 'Loading...' 
                      : `${userBalance} ${tokenSymbol || tokenName}`
                    }
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              </div>
            )}

            {!isBalanceLoading && hasRequiredTokens ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-600 dark:text-green-400">You have sufficient tokens!</span>
                </div>
              </div>
            ) : !isBalanceLoading && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Insufficient tokens. Please acquire more {tokenSymbol || tokenName} tokens on {getChainDisplayName(chainType)}.
                    {verificationAttempted && (
                      <span className="block mt-1 text-xs">Wallet will be disconnected in 3 seconds...</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {debugInfo && (
              <details className="mt-4">
                <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                  Debug Info
                </summary>
                <pre className="text-xs text-gray-500 dark:text-gray-400 mt-2 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto max-h-32">
                  {debugInfo}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Close
            </button>
            
            <button
              onClick={handleVerify}
              disabled={!hasRequiredTokens || isLoading || isBalanceLoading}
              className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors ${
                hasRequiredTokens && !isLoading && !isBalanceLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : isBalanceLoading ? (
                'Loading Balance...'
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChainSpecificVerification; 