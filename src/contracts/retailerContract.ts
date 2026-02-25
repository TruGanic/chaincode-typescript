/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

@Info({title: 'RetailerContract', description: 'Handles the final receipt and audit of food batches'})
export class RetailerContract extends Contract {

    
    /**
     * GetAssetHistory: Returns the full lifecycle of a batch.
     * Accessible to auditors and retailers to verify the journey.
     */
    @Transaction(false)
    @Returns('string')
    public async GetAssetHistory(ctx: Context, batchID: string): Promise<string> {
        const exists = await this.AssetExists(ctx, batchID);
        if (!exists) {
            throw new Error(`The asset ${batchID} does not exist`);
        }

        const iterator = await ctx.stub.getHistoryForKey(batchID);
        const allResults = [];

        while (true) {
            const res = await iterator.next();

            if (res.value) {
                const record = {
                    txId: res.value.txId,
                    // The actual timestamp from the block header
                    blockTimestamp: res.value.timestamp, 
                    isDelete: res.value.isDelete,
                    // The data at that specific point in time
                    data: res.value.value.length > 0 ? JSON.parse(res.value.value.toString()) : null
                };
                allResults.push(record);
            }

            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    // Helper to check existence (usually shared or imported)
    @Transaction(false)
    public async AssetExists(ctx: Context, batchID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(batchID);
        return (!!buffer && buffer.length > 0);
    }
}