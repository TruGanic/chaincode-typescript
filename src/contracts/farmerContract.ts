import { Context, Contract, Info, Transaction, Returns } from 'fabric-contract-api';
import { FoodBatch } from '../assets/foodBatch';
import { DateUtils } from '../utils/dateUtils';

@Info({title: 'FarmerContract', description: 'Handles initial harvest recording'})
export class FarmerContract extends Contract {

    @Transaction()
    public async CreateHarvestRecord(
        ctx: Context, 
        batchId: string, 
        farmerId: string, 
        organicLevel: string,
        plantedDate: string,
        harvestedDate: string
    ): Promise<void> {
        const exists = await this.AssetExists(ctx, batchId);
        if (exists) {
            throw new Error(`The batch ${batchId} already exists.`);
        }

        const asset = new FoodBatch();
        asset.batchID = batchId;
        asset.farmerId = farmerId;
        asset.organicLevel = organicLevel;
        asset.plantedDate = plantedDate;
        asset.harvestedDate = harvestedDate;
        
        asset.status = 'HARVESTED';
        

        await ctx.stub.putState(batchId, Buffer.from(JSON.stringify(asset)));
        console.info(`[Blockchain] Harvest Record Created for ${batchId} by Farmer ${farmerId}`);
    }

    @Transaction(false)
    @Returns('boolean')
    public async AssetExists(ctx: Context, batchID: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(batchID);
        return (!!buffer && buffer.length > 0);
    }
}