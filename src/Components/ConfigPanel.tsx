import React, { useState } from 'react';
import { useAppConfig, ChainType } from './AppConfig';

const ConfigPanel: React.FC = () => {
  const {
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
  } = useAppConfig();

  const [isOpen, setIsOpen] = useState(false);

  const chains: { value: ChainType; label: string; description: string }[] = [
    { value: 'ethereum', label: 'Ethereum', description: 'ERC20' },
    { value: 'base', label: 'Base', description: 'ERC20' },
    { value: 'polygon', label: 'Polygon', description: 'ERC20' },
    { value: 'arbitrum', label: 'Arbitrum', description: 'ERC20' },
    { value: 'optimism', label: 'Optimism', description: 'ERC20' },
    { value: 'goerli', label: 'Goerli', description: 'Testnet' },
    { value: 'sepolia', label: 'Sepolia', description: 'Testnet' },
    { value: 'polygonMumbai', label: 'Polygon Mumbai', description: 'Testnet' },
    { value: 'optimismGoerli', label: 'Optimism Goerli', description: 'Testnet' },
    { value: 'arbitrumSepolia', label: 'Arbitrum Sepolia', description: 'Testnet' },
    { value: 'baseSepolia', label: 'Base Sepolia', description: 'Testnet' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        ⚙️ Config
      </button>

      {/* Configuration Panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 bg-zinc-800 rounded-lg p-6 shadow-2xl border border-zinc-700 min-w-[500px] max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">App Configuration</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          {/* Flow Toggle */}
          <div className="mb-6">
            <label className="flex items-center text-white mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTokenVerification}
                onChange={(e) => setEnableTokenVerification(e.target.checked)}
                className="mr-3 w-4 h-4 rounded"
              />
              <span>Enable Token Verification Flow</span>
            </label>
            <p className="text-sm text-gray-400 ml-7">
              When enabled, users must hold specified tokens to access the app.
            </p>
          </div>

          {/* Token Configuration */}
          {enableTokenVerification && (
            <div className="space-y-4">
              {/* Chain Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Blockchain Network
                </label>
                <select
                  value={selectedChain}
                  onChange={(e) => setSelectedChain(e.target.value as ChainType)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:border-blue-500 focus:outline-none text-sm"
                >
                  {chains.map((chain) => (
                    <option key={chain.value} value={chain.value}>
                      {chain.label} ({chain.description})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Token Name
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="e.g., USDC, DAI, Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Token Address
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="0x..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter ERC20 contract address (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Required Amount
                </label>
                <input
                  type="text"
                  value={requiredTokenAmount}
                  onChange={(e) => setRequiredTokenAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-white focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="1"
                />
              </div>

              {/* Preview */}
              <div className="bg-zinc-700 rounded p-3">
                <p className="text-sm text-gray-400">Preview:</p>
                <p className="text-white text-sm">
                  Users need {requiredTokenAmount} {tokenName} tokens on {chains.find(c => c.value === selectedChain)?.label}
                </p>
                {tokenAddress && (
                  <p className="text-xs text-gray-400 break-all mt-1">
                    Address: {tokenAddress}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-4 border-t border-zinc-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel; 