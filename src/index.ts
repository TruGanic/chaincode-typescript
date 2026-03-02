import { TransportContract } from './contracts/transportContract';
import { RetailerContract } from './contracts/retailerContract';
import { FarmerContract } from './contracts/farmerContract';

export { TransportContract } from './contracts/transportContract';
export { RetailerContract } from './contracts/retailerContract'; 
export { FarmerContract } from './contracts/farmerContract'; 

// Register both contracts here
export const contracts: any[] = [ 
    TransportContract, 
    RetailerContract,
    FarmerContract
];