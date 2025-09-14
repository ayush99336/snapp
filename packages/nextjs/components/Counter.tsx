"use client";

import { useState, useEffect } from "react";
import { useAccount } from "~~/hooks/useAccount";
import { useScaffoldReadContract } from "~~/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-stark/useScaffoldWriteContract";
import { notification } from "~~/utils/scaffold-stark";

export const Counter = () => {
    const { address: connectedAddress } = useAccount();
    const [newCounterValue, setNewCounterValue] = useState<string>("");

    // Read the current counter value
    const { data: counterValue, refetch: refetchCounter } = useScaffoldReadContract({
        contractName: "CounterContract",
        functionName: "get_counter",
        watch: false, // Disable watch to avoid block_id issues
    });

    // Read the contract owner
    const { data: owner, refetch: refetchOwner } = useScaffoldReadContract({
        contractName: "CounterContract",
        functionName: "owner",
        watch: false, // Disable watch to avoid block_id issues
    });

    // Auto-refresh data every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refetchCounter();
            refetchOwner();
        }, 10000);

        return () => clearInterval(interval);
    }, [refetchCounter, refetchOwner]);

    // Initial data fetch
    useEffect(() => {
        refetchCounter();
        refetchOwner();
    }, [refetchCounter, refetchOwner]);

    // Write contract functions
    const { sendAsync: increaseCounter } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "increase_counter",
    });

    const { sendAsync: decreaseCounter } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "decrease_counter",
    });

    const { sendAsync: resetCounter } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "reset_counter",
    });

    const { sendAsync: setCounter } = useScaffoldWriteContract({
        contractName: "CounterContract",
        functionName: "set_counter",
        args: [0], // Default args, will be overridden
    });

    const handleIncrease = async () => {
        try {
            await increaseCounter();
            notification.success("Counter increased!");
            // Delay refetch to allow blockchain to update
            setTimeout(() => {
                refetchCounter();
            }, 2000);
        } catch (error) {
            console.error("Error increasing counter:", error);
            notification.error("Failed to increase counter");
        }
    };

    const handleDecrease = async () => {
        try {
            await decreaseCounter();
            notification.success("Counter decreased!");
            // Delay refetch to allow blockchain to update
            setTimeout(() => {
                refetchCounter();
            }, 2000);
        } catch (error) {
            console.error("Error decreasing counter:", error);
            notification.error("Failed to decrease counter");
        }
    };

    const handleReset = async () => {
        try {
            await resetCounter();
            notification.success("Counter reset!");
            // Delay refetch to allow blockchain to update
            setTimeout(() => {
                refetchCounter();
            }, 2000);
        } catch (error) {
            console.error("Error resetting counter:", error);
            notification.error("Failed to reset counter");
        }
    };

    const handleSetCounter = async () => {
        if (!newCounterValue || isNaN(Number(newCounterValue))) {
            notification.error("Please enter a valid number");
            return;
        }

        try {
            await setCounter({
                args: [Number(newCounterValue)],
            });
            notification.success(`Counter set to ${newCounterValue}!`);
            setNewCounterValue("");
            // Delay refetch to allow blockchain to update
            setTimeout(() => {
                refetchCounter();
            }, 2000);
        } catch (error) {
            console.error("Error setting counter:", error);
            notification.error("Failed to set counter");
        }
    };

    const handleManualRefresh = () => {
        refetchCounter();
        refetchOwner();
        notification.info("Data refreshed!");
    };

  // Debug logging to understand the data format
  console.log("Counter Debug - counterValue:", counterValue);
  console.log("Counter Debug - owner:", owner);

  // Handle counter value parsing more robustly
  const currentValue = (() => {
    if (!counterValue) return 0;
    
    // If it's an array, try to get the first element
    if (Array.isArray(counterValue)) {
      const firstValue = counterValue[0];
      if (typeof firstValue === 'number') return firstValue;
      if (typeof firstValue === 'string') return parseInt(firstValue) || 0;
      if (typeof firstValue === 'bigint') return Number(firstValue);
      if (firstValue && typeof firstValue === 'object' && firstValue.toString) {
        const parsed = parseInt(firstValue.toString());
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
    
    // If it's a direct value
    if (typeof counterValue === 'number') return counterValue;
    if (typeof counterValue === 'string') return parseInt(counterValue) || 0;
    if (typeof counterValue === 'bigint') return Number(counterValue);
    
    return 0;
  })();
  
  // Handle owner display - ensure it's always a string and properly formatted
  const ownerAddress: string | null = (() => {
    console.log("Owner Debug - raw owner:", owner);
    if (!owner) return null;
    
    // Convert to string first to handle any type
    const ownerStr = String(owner);
    
    // If it's an array-like string representation, try to extract the actual address
    if (ownerStr.includes('[') && ownerStr.includes(']')) {
      // Handle case where it might be stringified array
      try {
        const parsed = JSON.parse(ownerStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const addr = String(parsed[0]);
          return addr.startsWith('0x') ? addr : `0x${addr}`;
        }
      } catch (e) {
        // If parsing fails, continue with original string
      }
    }
    
    // Ensure it has 0x prefix if it looks like a hex address
    if (ownerStr.length > 10 && !ownerStr.startsWith('0x')) {
      return `0x${ownerStr}`;
    }
    
    return ownerStr.startsWith('0x') ? ownerStr : ownerStr;
  })();

  const isOwner = connectedAddress === ownerAddress;    return (
        <div className="flex flex-col items-center space-y-8 bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-200">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-600 mb-2">Counter DApp</h2>
                <p className="text-gray-600 text-sm">
                    Deployed on Sepolia Testnet
                </p>
                <button
                    className="btn btn-sm btn-outline btn-primary mt-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                    onClick={handleManualRefresh}
                >
                    🔄 Refresh Data
                </button>
            </div>

            {/* Counter Display */}
            <div className="text-center">
                <div className="text-6xl font-bold text-blue-700 mb-2">
                    {String(currentValue)}
                </div>
                <p className="text-sm text-gray-500">Current Value</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4 w-full">
                <div className="flex space-x-3">
                    <button
                        className="btn flex-1 bg-green-500 hover:bg-green-600 text-white border-none"
                        onClick={handleIncrease}
                        disabled={!connectedAddress}
                    >
                        +1
                    </button>
                    <button
                        className="btn flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none"
                        onClick={handleDecrease}
                        disabled={!connectedAddress || currentValue === 0}
                    >
                        -1
                    </button>
                </div>

                <button
                    className="btn w-full bg-red-500 hover:bg-red-600 text-white border-none"
                    onClick={handleReset}
                    disabled={!connectedAddress}
                >
                    Reset Counter
                </button>

                {/* Set Counter (Owner Only) */}
                {isOwner && (
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-amber-600 mb-2 font-medium">Owner Functions</p>
                        <div className="flex space-x-2">
                            <input
                                type="number"
                                placeholder="Enter value"
                                className="input input-bordered flex-1 border-gray-300 focus:border-blue-500 bg-white text-gray-700"
                                value={newCounterValue}
                                onChange={(e) => setNewCounterValue(e.target.value)}
                            />
                            <button
                                className="btn bg-blue-500 hover:bg-blue-600 text-white border-none"
                                onClick={handleSetCounter}
                                disabled={!connectedAddress || !newCounterValue}
                            >
                                Set
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Contract Info */}
            <div className="text-xs text-gray-500 text-center space-y-1 border-t border-gray-100 pt-4 w-full">
                <p className="font-medium text-gray-600">Contract: CounterContract</p>
                <p>Owner: {ownerAddress ? `${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}` : "Loading..."}</p>
                {!connectedAddress && (
                    <p className="text-amber-600 font-medium">Connect your wallet to interact</p>
                )}
            </div>
        </div>
    );
};
