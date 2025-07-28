import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ChainType = 'ethereum' | 'solana' | 'base' | 'polygon' | 'arbitrum' | 'goerli' | 'sepolia' | 'polygonMumbai' | 'optimism' | 'optimismGoerli';

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