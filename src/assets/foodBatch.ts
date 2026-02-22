/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';

@Object()
export class FoodBatch {

    @Property()
    public batchID: string;

    @Property()
    public produceType: string;

    @Property()
    public supplierId: string;

    @Property()
    public farmerName: string;

    // Stores the Supabase UUID of the transport agent
    @Property()
    public transporterId: string; 

    @Property()
    public pickupLocation: string;

    @Property()
    public weightKg: string;

    // Stores the IPFS CID for the uploaded invoice
    @Property()
    public invoiceHash: string;

    @Property()
    public notes: string;

    // Status: 'HARVESTED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED'
    @Property()
    public status: string; 

    // --- NOVELTY: OFFLINE DATA SYNC ---
    @Property()
    public minTemp: number;

    @Property()
    public maxTemp: number;

    @Property()
    public avgTemp: number;

    @Property()
    public merkleRoot: string; 

    @Property()
    public timestamp: string;
}