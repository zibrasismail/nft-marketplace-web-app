import { aptos } from "@/config/aptosConfig";
import { CONTRACT_NAME, MARKETPLACE_ADDRESS } from "@/config/constants";

async function initializeMarketplace() {
  try {
    const payload = {
      function: `${MARKETPLACE_ADDRESS}::${CONTRACT_NAME}::initialize`,
      type_arguments: [],
      arguments: [],
    };

    // @ts-expect-error window is not typed
    const response = await window.aptos.signAndSubmitTransaction(payload);
    await aptos.waitForTransaction({ transactionHash: response.hash });

    console.log("Marketplace initialized successfully!");
  } catch (error) {
    // Initialization is optional, so we can ignore errors
    console.log("Marketplace initialization skipped:", error);
  }
}

export default initializeMarketplace;
