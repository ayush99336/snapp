import {
  deployContract,
  executeDeployCalls,
  exportDeployments,
  deployer,
  assertDeployerDefined,
  assertRpcNetworkActive,
  assertDeployerSignable,
} from "./deploy-contract";
import { green } from "./helpers/colorize-log";

/**
 * Deploy a contract using the specified parameters.
 *
 * @example (deploy contract with constructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       constructorArgs: {
 *         owner: deployer.address,
 *       },
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 * @example (deploy contract without constructorArgs)
 * const deployScript = async (): Promise<void> => {
 *   await deployContract(
 *     {
 *       contract: "YourContract",
 *       contractName: "YourContractExportName",
 *       options: {
 *         maxFee: BigInt(1000000000000)
 *       }
 *     }
 *   );
 * };
 *
 *
 * @returns {Promise<void>}
 */
const deployScript = async (): Promise<void> => {
    console.log("🔍 Debug info:");
  console.log("Deployer address:", deployer.address);
  console.log("Init value:", 15);
  await deployContract({
    contract: "CounterContract",
    constructorArgs: {
      init_value: 15,                   // whatever initial counter you want
      owner: deployer.address,         // your account as owner
    },
    options: {
      tip: 10000000000000000n,  // 0.01 STRK tip for Sepolia
      resourceBounds: {
        l1_gas: { max_amount: 0x20000n, max_price_per_unit: 0x5af3107a4000n },
        l2_gas: { max_amount: 0x0n, max_price_per_unit: 0x0n },
        l1_data_gas: { max_amount: 0x20000n, max_price_per_unit: 0x5af3107a4000n }
      }
    }
  });
};

const main = async (): Promise<void> => {
  try {
    assertDeployerDefined();

    await Promise.all([assertRpcNetworkActive(), assertDeployerSignable()]);

    await deployScript();
    await executeDeployCalls();
    exportDeployments();

    console.log(green("All Setup Done!"));
  } catch (err) {
    console.log(err);
    process.exit(1); //exit with error so that non subsequent scripts are run
  }
};

main();
