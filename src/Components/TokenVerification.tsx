import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { ethers } from 'ethers';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
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
  const [userBalance, setUserBalance] = useState<string>('0');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Read token balance
  const { data: balanceData, refetch: refetchBalance } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!tokenAddress,
  });

  // Read token symbol
  const { data: symbolData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'symbol',
    enabled: !!tokenAddress,
  });

  // Read token decimals
  const { data: decimalsData } = useContractRead({
    addressOrName: tokenAddress,
    contractInterface: ERC20_ABI,
    functionName: 'decimals',
    enabled: !!tokenAddress,
  });

  useEffect(() => {
    if (balanceData) {
      const balance = ethers.utils.formatUnits(balanceData.toString(), tokenDecimals);
      setUserBalance(balance);
    }
  }, [balanceData, tokenDecimals]);

  useEffect(() => {
    if (symbolData) {
      setTokenSymbol(symbolData.toString());
    }
  }, [symbolData]);

  useEffect(() => {
    if (decimalsData) {
      setTokenDecimals(Number(decimalsData));
    }
  }, [decimalsData]);

  useEffect(() => {
    if (isConnected && address) {
      refetchBalance();
    }
  }, [isConnected, address, refetchBalance]);

  const hasRequiredTokens = parseFloat(userBalance) >= parseFloat(requiredAmount);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      await refetchBalance();
      if (hasRequiredTokens) {
        onVerificationComplete();
      }
    } catch (error) {
      console.error('Error verifying tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-zinc-800 rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to verify token holdings.
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Token Verification Required</h2>
        
        <div className="mb-6">
          <p className="text-gray-300 mb-2">
            You need to hold at least <span className="font-bold text-white">{requiredAmount}</span> {tokenSymbol || tokenName} tokens to continue.
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
        </div>

        {hasRequiredTokens ? (
          <div className="text-green-400 mb-4">
            ✅ You have sufficient tokens!
          </div>
        ) : (
          <div className="text-red-400 mb-4">
            ❌ Insufficient tokens. Please acquire more {tokenSymbol || tokenName} tokens.
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

export default TokenVerification; 