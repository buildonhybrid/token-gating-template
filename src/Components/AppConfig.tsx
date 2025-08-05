import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mainnet, base, polygon, arbitrum, optimism, goerli, sepolia, polygonMumbai, optimismGoerli, arbitrumSepolia, baseSepolia, Chain } from 'viem/chains';

export type ChainType = 'ethereum' | 'base' | 'polygon' | 'arbitrum' | 'optimism' | 'goerli' | 'sepolia' | 'polygonMumbai' | 'optimismGoerli' | 'arbitrumSepolia' | 'baseSepolia';

export const getViemChain = (chainType: ChainType): Chain | null => {
  const chainMap: Record<ChainType, Chain | null> = {
    ethereum: mainnet,
    base: base,
    polygon: polygon,
    arbitrum: arbitrum,
    optimism: optimism,
    goerli: goerli,
    sepolia: sepolia,
    polygonMumbai: polygonMumbai,
    optimismGoerli: optimismGoerli,
    arbitrumSepolia: arbitrumSepolia,
    baseSepolia: baseSepolia,
  };
  return chainMap[chainType];
};

export const getChainId = (chainType: ChainType): number | null => {
  const chain = getViemChain(chainType);
  return chain?.id || null;
};

export const getRpcUrl = (chainType: ChainType): string | null => {
  const chain = getViemChain(chainType);
  return chain?.rpcUrls.default.http[0] || null;
};

interface AppConfigContextType {
  enableTokenVerification: boolean;
  setEnableTokenVerification: (enabled: boolean) => void;
  selectedChain: ChainType;
  setSelectedChain: (chain: ChainType) => void;
  tokenAddress: string;
  setTokenAddress: (address: string) => void;
  requiredTokenAmount: string;
  setRequiredTokenAmount: (amount: string) => void;
  tokenName: string;
  setTokenName: (name: string) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};

interface AppConfigProviderProps {
  children: ReactNode;
}

export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  const [enableTokenVerification, setEnableTokenVerification] = useState<boolean>(false);
  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [requiredTokenAmount, setRequiredTokenAmount] = useState<string>('1');
  const [tokenName, setTokenName] = useState<string>('Token');

  const value = {
    enableTokenVerification,
    setEnableTokenVerification,
    selectedChain,
    setSelectedChain,
    tokenAddress,
    setTokenAddress,
    requiredTokenAmount,
    setRequiredTokenAmount,
    tokenName,
    setTokenName,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
}; 