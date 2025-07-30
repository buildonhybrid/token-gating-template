import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function LLMTemplateExample() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
          AI-Powered Content Generator
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
          Generate high-quality content with advanced AI models. 
          Token-gated access ensures exclusive benefits for token holders.
        </p>

        {!isConnected ? (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-gray-300 mb-6">
                Connect your wallet to access the AI content generator and verify your token holdings.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-4">
                🎉 Access Granted!
              </h2>
              <p className="text-gray-300 mb-6">
                Your wallet is connected and verified. You now have access to the AI content generator.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">📝 Content Generation</h3>
                  <p className="text-gray-300 text-sm">
                    Generate articles, blog posts, and marketing copy with advanced AI models.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">🎨 Creative Writing</h3>
                  <p className="text-gray-300 text-sm">
                    Create stories, poems, and creative content with AI assistance.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">📊 Data Analysis</h3>
                  <p className="text-gray-300 text-sm">
                    Analyze and summarize data with intelligent AI insights.
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">🔧 Code Generation</h3>
                  <p className="text-gray-300 text-sm">
                    Generate code snippets and technical documentation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 