import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead, useDisconnect } from 'wagmi';
import { ethers } from 'ethers';

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

interface TokenVerificationProps {
  tokenAddress: string;
  requiredAmount: string;
  tokenName?: string;
  onVerificationComplete: () => void;
  onClose: () => void;
}

const TokenVerification: React.FC<TokenVerificationProps> = ({
  tokenAddress,
  requiredAmount,
  tokenName = "Token",
  onVerificationComplete,
  onClose
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [userBalance, setUserBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [verificationAttempted, setVerificationAttempted] = useState<boolean>(false);

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

  const { data: balanceData, refetch: refetchBalance } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress && !isInitializing,
  });

  const { data: symbolData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress && !isInitializing,
  });

  const { data: decimalsData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress && !isInitializing,
  });

  useEffect(() => {
    if (!isInitializing && balanceData) {
      try {
        const balance = ethers.utils.formatUnits(balanceData.toString(), tokenDecimals);
        setUserBalance(balance);
      } catch (err) {
        console.error('Error formatting balance:', err);
        setError('Error formatting token balance');
      }
    }
  }, [balanceData, tokenDecimals, isInitializing]);

  useEffect(() => {
    if (!isInitializing && symbolData) {
      setTokenSymbol(symbolData.toString());
    }
  }, [symbolData, isInitializing]);

  useEffect(() => {
    if (!isInitializing && decimalsData) {
      setTokenDecimals(Number(decimalsData));
    }
  }, [decimalsData, isInitializing]);

  const hasRequiredTokens = parseFloat(userBalance) >= parseFloat(requiredAmount);

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setVerificationAttempted(true);
      setError('');
      
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
                Please connect your wallet to verify token holdings.
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

  if (isInitializing) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Token Verification
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
              Token Verification
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
                hasRequiredTokens 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                {hasRequiredTokens ? (
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
                {hasRequiredTokens ? 'Verification Successful' : 'Verification Required'}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You need to hold at least <span className="font-semibold text-gray-900 dark:text-white">{requiredAmount}</span> {tokenSymbol || tokenName} tokens to continue.
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
                    hasRequiredTokens 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {userBalance} {tokenSymbol || tokenName}
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

            {hasRequiredTokens ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-green-600 dark:text-green-400">You have sufficient tokens!</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Insufficient tokens. Please acquire more {tokenSymbol || tokenName} tokens.
                    {verificationAttempted && (
                      <span className="block mt-1 text-xs">Wallet will be disconnected in 3 seconds...</span>
                    )}
                  </span>
                </div>
              </div>
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
              disabled={!hasRequiredTokens || isLoading}
              className={`flex-1 font-medium py-3 px-4 rounded-xl transition-colors ${
                hasRequiredTokens && !isLoading
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

export default TokenVerification; 