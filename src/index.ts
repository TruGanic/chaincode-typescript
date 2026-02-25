/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportContract } from './contracts/transportContract';
import { RetailerContract } from './contracts/retailerContract'; // Import the new contract

export { TransportContract } from './contracts/transportContract';
export { RetailerContract } from './contracts/retailerContract'; // Export for external visibility

// Register both contracts here
export const contracts: any[] = [ 
    TransportContract, 
    RetailerContract 
];