import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { FoodBatch } from '../assets/foodBatch';
import { DateUtils } from '../utils/dateUtils';

@Info({ title: 'TransportContract', description: 'Secure Transport Traceability with Merkle Proofs' })
export class TransportContract extends Contract {


    // 1. Confirm Pickup (Start of Journey)

    @Transaction()
    public async ConfirmPickup(
        ctx: Context,
        batchID: string,
        produceType: string,
        farmerName: string,
        supplierId: string,
        transporterId: string,
        location: string,
        weightKg: string,
        invoiceHash: string,
        notes: string,
        pickupTimeStamp: string
    ): Promise<void> {
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
        }
        const currentTime = DateUtils.getTxDateISO(ctx);

        // Map backend payload data
        asset.produceType = produceType;
        asset.farmerName = farmerName;
        asset.supplierId = supplierId;
        asset.transporterId = transporterId; // Supabase Auth ID
        asset.pickupLocation = location;
        asset.weightKg = weightKg;
        asset.invoiceHash = invoiceHash;     // IPFS CID
        asset.notes = notes;

        asset.status = 'IN_TRANSIT';

        asset.pickupTimeStamp = pickupTimeStamp;

        // Initialize deliveryTimestamp as empty or "PENDING"
        asset.deliveryTimestamp = '';
        asset.syncTimestamp = currentTime;

        // Initialize "Null" sensor data until trip ends
        asset.minTemp = 0;
        asset.maxTemp = 0;
        asset.avgTemp = 0;
        asset.minHumidity = 0;
        asset.maxHumidity = 0;
        asset.avgHumidity = 0;
        asset.merkleRoot = 'PENDING';

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(asset)));
        console.info(`[Blockchain] Pickup Confirmed for ${batchID} by Transporter ${transporterId}`);
    }


    // 2. Complete Trip (End of Journey - The Sync)

    @Transaction()
    public async CompleteTrip(
        ctx: Context,
        batchID: string,
        minTemp: string,
        maxTemp: string,
        avgTemp: string,
        minHumidity: string,
        maxHumidity: string,
        avgHumidity: string,
        merkleRoot: string
    ): Promise<void> {

        const exists = await this.AssetExists(ctx, batchID);
        if (!exists) {
            throw new Error(`Batch ${batchID} not found. Ensure Pickup is synced first.`);
        }

        const assetString = await this.ReadAsset(ctx, batchID);
        const asset = JSON.parse(assetString) as FoodBatch;

        const currentTime = DateUtils.getTxDateISO(ctx);

        asset.minTemp = parseFloat(minTemp);
        asset.maxTemp = parseFloat(maxTemp);
        asset.avgTemp = parseFloat(avgTemp);
        asset.minHumidity = parseFloat(minHumidity);
        asset.maxHumidity = parseFloat(maxHumidity);
        asset.avgHumidity = parseFloat(avgHumidity);
        asset.merkleRoot = merkleRoot;
        asset.status = 'DELIVERED';
        asset.deliveryTimestamp = currentTime;
        asset.syncTimestamp = currentTime;

        await ctx.stub.putState(batchID, Buffer.from(JSON.stringify(asset)));
        console.info(`[Blockchain] Trip Completed for ${batchID}. Integrity Root: ${merkleRoot}`);
    }


    // 3. Read Asset (Query)

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


    // Helper: Check Existence

    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, batchID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(batchID);
        return (!!buffer && buffer.length > 0);
    }
}