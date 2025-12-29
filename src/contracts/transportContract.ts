/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { FoodBatch } from '../assets/foodBatch';
import { DateUtils } from '../utils/dateUtils';

@Info({title: 'TransportContract', description: 'Secure Transport Traceability with Merkle Proofs'})
export class TransportContract extends Contract {

    // =========================================================================
    // 1. Confirm Pickup (Start of Journey)
    // =========================================================================
    // If Online: Called immediately at farm.
    // If Offline: Data is cached on phone and syncs later.
    @Transaction()
    public async ConfirmPickup(ctx: Context, batchID: string, farmerName: string, newOwner: string, location: string): Promise<void> {
        const exists = await this.AssetExists(ctx, batchID);
        
        let asset: FoodBatch;

        if (exists) {
            // Asset exists (maybe created by Farmer App earlier)
            const assetString = await this.ReadAsset(ctx, batchID);
            asset = JSON.parse(assetString);
        } else {
            // New Asset (Driver creates it)
            asset = new FoodBatch();
            asset.batchID = batchID;
            asset.farmerName = farmerName;
        }
        

        asset.currentOwner = newOwner;
        asset.pickupLocation = location;
        asset.status = 'IN_TRANSIT';
        asset.timestamp = DateUtils.getTxDateISO(ctx);

        // Initialize "Null" sensor data until trip ends
        asset.minTemp = 0;
        asset.maxTemp = 0;
        asset.avgTemp = 0;
        asset.merkleRoot = 'PENDING';

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(asset)));
        console.info(`[Blockchain] Pickup Confirmed for ${batchID}`);
    }

    // =========================================================================
    // 2. Complete Trip (End of Journey - The Sync)
    // =========================================================================
    // This receives the "Novelty" payload: Summary Stats + Merkle Root
    @Transaction()
    public async CompleteTrip(ctx: Context, batchID: string, min: string, max: string, avg: string, merkleRoot: string): Promise<void> {
        const exists = await this.AssetExists(ctx, batchID);
        if (!exists) {
            throw new Error(`Batch ${batchID} not found. Ensure Pickup is synced first.`);
        }

        const assetString = await this.ReadAsset(ctx, batchID);
        const asset = JSON.parse(assetString) as FoodBatch;

        
        // Update with Transport Data
        asset.minTemp = parseFloat(min);
        asset.maxTemp = parseFloat(max);
        asset.avgTemp = parseFloat(avg);
        asset.merkleRoot = merkleRoot; // The Proof of Integrity
        
        asset.status = 'DELIVERED';
        
        asset.timestamp = DateUtils.getTxDateISO(ctx);

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(asset)));
        console.info(`[Blockchain] Trip Completed for ${batchID}. Integrity Root: ${merkleRoot}`);
    }

    // =========================================================================
    // 3. Read Asset (Query)
    // =========================================================================
    @Transaction(false)
    @Returns('string')
    public async ReadAsset(ctx: Context, batchID: string): Promise<string> {
        const exists = await this.AssetExists(ctx, batchID);
        if (!exists) {
            throw new Error(`The asset ${batchID} does not exist`);
        }
        const buffer = await ctx.stub.getState(batchID);
        return buffer.toString();
    }

    // =========================================================================
    // Helper: Check Existence
    // =========================================================================
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, batchID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(batchID);
        return (!!buffer && buffer.length > 0);
    }
}