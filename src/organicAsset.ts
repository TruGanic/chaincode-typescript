/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';

// 1. Define the Asset Structure
export class OrganicAsset {
    public docType?: string;
    public assetID: string;
    public owner: string;
    public currentState: string;
    public location: string;
    public timestamp: string;
}

// 2. Define the Contract Class (MUST have 'export')
@Info({title: 'OrganicAssetContract', description: 'Smart contract for Organic Food Traceability'})
export class OrganicAssetContract extends Contract {

    // =========================================================================
    // InitLedger: Create initial test data
    // =========================================================================
    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const assets: OrganicAsset[] = [
            {
                assetID: 'ORG101',
                docType: 'asset',
                owner: 'Farm_A_MSP',
                currentState: 'Harvested',
                location: 'Kandy, SL',
                timestamp: '2025-12-04T12:00:00Z',
            },
            {
                assetID: 'ORG102',
                docType: 'asset',
                owner: 'Processor_X_MSP',
                currentState: 'Processed',
                location: 'Colombo, SL',
                timestamp: '2025-12-04T15:00:00Z',
            },
        ];

        for (const asset of assets) {
            await ctx.stub.putState(asset.assetID, Buffer.from(JSON.stringify(asset)));
            console.info(`Asset ${asset.assetID} initialized`);
        }
    }

    // =========================================================================
    // CreateAsset: Create a new organic asset
    // =========================================================================
    @Transaction()
    public async CreateAsset(
        ctx: Context,
        assetID: string,
        owner: string,
        currentState: string,
        location: string,
        timestamp: string
    ): Promise<void> {
        const exists = await this.AssetExists(ctx, assetID);
        if (exists) {
            throw new Error(`The asset ${assetID} already exists`);
        }

        const asset: OrganicAsset = {
            docType: 'asset',
            assetID,
            owner,
            currentState,
            location,
            timestamp,
        };
        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(asset)));
    }

    // =========================================================================
    // QueryAsset: Read asset data
    // =========================================================================
    @Transaction(false)
    @Returns('string')
    public async QueryAsset(ctx: Context, assetID: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(assetID);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${assetID} does not exist`);
        }
        return assetJSON.toString();
    }

    // =========================================================================
    // AssetExists: Helper function
    // =========================================================================
    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, assetID: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(assetID);
        return assetJSON && assetJSON.length > 0;
    }
}