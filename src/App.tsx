import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import Github from "./Components/github";
import Twitter from "./Components/twitter";
import ChainSpecificVerification from "./Components/ChainSpecificVerification";
import ConfigPanel from "./Components/ConfigPanel";
import { useAppConfig } from "./Components/AppConfig";

function App({ showConfigPanel = true }: { showConfigPanel?: boolean }) {
  const { address, isConnected } = useAccount();
  const {
    enableTokenVerification,
    selectedChain,
    tokenAddress,
    requiredTokenAmount,
    tokenName,
  } = useAppConfig();

  const [showTokenVerification, setShowTokenVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (isConnected && enableTokenVerification && !isVerified) {
      setShowTokenVerification(true);
    }
  }, [isConnected, enableTokenVerification, isVerified]);

  useEffect(() => {
    if (!isConnected) {
      setIsVerified(false);
      setShowTokenVerification(false);
      setIsBlocked(false);
    }
  }, [isConnected]);

  useEffect(() => {
    if (enableTokenVerification && isConnected && !isVerified) {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [enableTokenVerification, isConnected, isVerified]);

  const handleVerificationComplete = () => {
    setIsVerified(true);
    setShowTokenVerification(false);
    setIsBlocked(false);
  };

  const handleVerificationClose = () => {
    setShowTokenVerification(false);
  };

  const effectiveTokenAddress = tokenAddress || "0x1234567890123456789012345678901234567890";

  if (isBlocked) {
    return (
      <div className="bg-zinc-900 flex justify-center items-center h-screen text-white w-screen p-10">
        {showConfigPanel && <ConfigPanel />}
        
        <div className="text-center max-w-2xl">
          <div className="text-red-400 text-6xl mb-6">🚫</div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl pb-6 font-bold">
            Access Denied
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            This application requires token verification. Please complete the verification process to continue.
          </p>
          
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Required Tokens</h2>
            <p className="text-gray-300">
              You need to hold at least <span className="font-bold text-white">{requiredTokenAmount}</span> {tokenName} tokens on {selectedChain} to access this application.
            </p>
            {tokenAddress && (
              <p className="text-sm text-gray-400 mt-2 break-all">
                Token Address: {tokenAddress}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <ConnectButton showBalance={false} />
          </div>

          <p className="text-sm text-gray-400 mt-6">
            Connect your wallet and complete token verification to unlock access.
          </p>
        </div>

        {showTokenVerification && (
          <ChainSpecificVerification
            chainType={selectedChain}
            tokenAddress={effectiveTokenAddress}
            requiredAmount={requiredTokenAmount}
            tokenName={tokenName}
            onVerificationComplete={handleVerificationComplete}
            onClose={handleVerificationClose}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 flex justify-center items-center h-screen text-white w-screen p-10">
      {showConfigPanel && <ConfigPanel />}
      
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl pb-10 font-bold text-center">
          gm 🌈{" "}
          <a
            href="https://rainbowkit.com"
            className="underline hover:text-[#356DF3]"
          >
            RainbowKit
          </a>{" "}
          +{" "}
          <a
            href="https://vitejs.dev"
            className="underline hover:text-[#356DF3]"
          >
            Vite
          </a>{" "}
          +{" "}
          <a
            href="https://reactjs.org"
            className="underline hover:text-[#356DF3]"
          >
            React
          </a>{" "}
          +{" "}
          <a
            href="https://tailwindcss.com"
            className="underline hover:text-[#356DF3]"
          >
            Tailwind
          </a>
          !
        </h1>
        
        <div className="flex justify-center">
          <ConnectButton showBalance={false} />
        </div>
        
        {enableTokenVerification && isConnected && (
          <div className="text-center mt-4">
            {isVerified ? (
              <div className="text-green-400 text-lg">
                ✅ Token verification completed on {selectedChain}!
              </div>
            ) : (
              <div className="text-yellow-400 text-lg">
                ⏳ Token verification required on {selectedChain}
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-col pt-10">
          <Github />
          <Twitter />
        </div>
      </div>

      {showTokenVerification && (
        <ChainSpecificVerification
          chainType={selectedChain}
          tokenAddress={effectiveTokenAddress}
          requiredAmount={requiredTokenAmount}
          tokenName={tokenName}
          onVerificationComplete={handleVerificationComplete}
          onClose={handleVerificationClose}
        />
      )}
    </div>
  );
}

export default App;
