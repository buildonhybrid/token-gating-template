# Token Verification System

A comprehensive token verification system for web3 applications with multi-chain support.

## Features

### ✅ Core Functionality
- **Multi-chain support**: Ethereum, Base, Polygon, Arbitrum, Solana (placeholder)
- **Token balance verification**: Check if users hold required tokens
- **Network switching**: Automatic detection and prompts
- **Auto-disconnect**: Disconnect wallet on failed verification
- **Debug information**: Detailed logging for troubleshooting

### ✅ Configuration Panel
- **Toggle verification**: Enable/disable token verification flow
- **Chain selection**: Choose from supported networks
- **Token configuration**: Set token name, address, and required amount
- **Preview functionality**: See what users need to hold

### ✅ LLM Template Features
- **Configurable visibility**: Hide config panel for LLM-generated apps
- **Token gating**: Block app access until verification is complete
- **Customizable requirements**: Set via prompt for LLM templates

## Usage

### Basic Usage
```tsx
import App from './App';

// Show config panel (default)
<App />

// Hide config panel for LLM templates
<App showConfigPanel={false} />
```

### LLM Template Usage
For LLM-generated applications, you can:

1. **Hide the config panel** by setting `showConfigPanel={false}`
2. **Configure requirements via prompt** by setting the app config values
3. **Enable strict token gating** that blocks access until verification

### Token Gating Flow
1. User connects wallet
2. If token verification is enabled:
   - Check if user has required tokens
   - If yes: Allow access to app
   - If no: Show blocking screen with verification popup
3. User must complete verification to access the app

## Configuration

### AppConfig Values
```tsx
{
  enableTokenVerification: boolean,    // Enable/disable verification
  selectedChain: ChainType,           // 'ethereum' | 'base' | 'polygon' | 'arbitrum' | 'solana'
  tokenAddress: string,               // Contract address (optional)
  requiredTokenAmount: string,        // Required token amount
  tokenName: string                   // Token name for display
}
```

### Example LLM Prompt
```
Create a web3 app that requires users to hold at least 1 USDC tokens on Ethereum network.
The token contract address is 0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C.
Hide the configuration panel and enable strict token gating.
```

### Example LLM Prompts for Different Tokens/Chains

**USDC on Ethereum:**
```
Create a web3 app that requires users to hold at least 1 USDC tokens on Ethereum network.
The token contract address is 0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C.
Hide the configuration panel and enable strict token gating.
```

**DAI on Polygon:**
```
Create a web3 app that requires users to hold at least 100 DAI tokens on Polygon network.
The token contract address is 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063.
Hide the configuration panel and enable strict token gating.
```

**WETH on Arbitrum:**
```
Create a web3 app that requires users to hold at least 0.1 WETH tokens on Arbitrum network.
The token contract address is 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1.
Hide the configuration panel and enable strict token gating.
```

## Supported Networks

The system uses **viem** for chain data and supports the following networks:

### EVM Chains
- **Ethereum Mainnet** (Chain ID: 1)
- **Base Mainnet** (Chain ID: 8453)
- **Polygon Mainnet** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)

### Testnets
- **Goerli** (Chain ID: 5)
- **Sepolia** (Chain ID: 11155111)
- **Polygon Mumbai** (Chain ID: 80001)
- **Optimism Goerli** (Chain ID: 420)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Base Sepolia** (Chain ID: 84532)

### Solana (Placeholder)
- **Solana Mainnet** (Requires @solana/web3.js integration)

### Chain Data Source
All chain information (Chain IDs, RPC URLs, block explorers) is sourced from **viem** to ensure accuracy and maintainability.

## Error Handling

The system provides comprehensive error handling:
- Network switching prompts
- Contract call failures
- Invalid token addresses
- Insufficient token balances
- Debug information for troubleshooting

## Security Features

- **Auto-disconnect**: Automatically disconnect wallet after failed verification
- **Network validation**: Ensure users are on correct network
- **Contract verification**: Validate contract existence and interface
- **Balance checking**: Verify actual token holdings

## Debug Information

The system provides detailed debug information including:
- Current network and chain type
- Contract address and user address
- Balance, symbol, and decimals data
- Error messages and stack traces
- Direct ethers.js call results

This helps with troubleshooting contract issues and network problems. 