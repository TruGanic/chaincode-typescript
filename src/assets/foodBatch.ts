/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class FoodBatch {

    @Property()
    public batchID: string;

    @Property()
    public farmerName: string;

    @Property()
    public currentOwner: string;

    @Property()
    public pickupLocation: string;

    // Status: 'HARVESTED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED'
    @Property()
    public status: string; 

    // --- NOVELTY: OFFLINE DATA SYNC ---
    // We do NOT store 10,000 sensor readings here. 
    // We store the aggregated stats and the cryptographic proof (Merkle Root).
    
    @Property()
    public minTemp: number;

    @Property()
    public maxTemp: number;

    @Property()
    public avgTemp: number;

    // The Merkle Root proves the integrity of the offline sensor log
    @Property()
    public merkleRoot: string; 

    @Property()
    public timestamp: string;
}