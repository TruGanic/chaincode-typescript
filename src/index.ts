/* src/index.ts */
console.log(">>>>>>>>>>>>>> CHAINCODE STARTING <<<<<<<<<<<<<<"); // Debug log

import { OrganicAssetContract } from './organicAsset';
export { OrganicAssetContract } from './organicAsset';
export const contracts: any[] = [ OrganicAssetContract ]; 
console.log(">>>>>>>>>>>>>> CONTRACTS EXPORTED <<<<<<<<<<<<<<"); // Debug log