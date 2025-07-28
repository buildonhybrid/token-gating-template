import React from 'react';
import App from './App';
import { AppConfigProvider } from './Components/AppConfig';

// Example: Generic Token Gated App for LLM Templates
const LLMTemplateExample: React.FC = () => {
  return (
    <AppConfigProvider>
      {/* 
        For LLM templates, hide the config panel and set requirements via code
        This allows the LLM to configure the app via prompt without showing UI controls
      */}
      <App showConfigPanel={false} />
    </AppConfigProvider>
  );
};

export default LLMTemplateExample;

/*
LLM Prompt Examples:

1. "Create a web3 app that requires users to hold at least 1 USDC tokens on Ethereum network.
   The token contract address is 0xA0b86a33E6441b8C4C8C8C8C8C8C8C8C8C8C8C8C.
   Hide the configuration panel and enable strict token gating."

2. "Create a web3 app that requires users to hold at least 100 DAI tokens on Polygon network.
   The token contract address is 0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063.
   Hide the configuration panel and enable strict token gating."

3. "Create a web3 app that requires users to hold at least 0.1 WETH tokens on Arbitrum network.
   The token contract address is 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1.
   Hide the configuration panel and enable strict token gating."

LLM would then:
1. Set enableTokenVerification: true
2. Set selectedChain: 'ethereum' | 'polygon' | 'arbitrum' | 'base'
3. Set tokenAddress: '[contract address]'
4. Set requiredTokenAmount: '[amount]'
5. Set tokenName: '[token name]'
6. Use <App showConfigPanel={false} />

This creates a generic token-gated app where:
- Users must connect wallet
- Users must be on the correct network
- Users must hold at least the required amount of specified tokens
- App is blocked until verification is complete
- No config panel is shown to users
- Works with any ERC20 token on any supported chain
*/ 