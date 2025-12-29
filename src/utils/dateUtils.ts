/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';

export class DateUtils {

    /**
     * Helper to get a deterministic ISO string from the transaction timestamp.
     * Use this instead of new Date() to avoid endorsement errors.
     */
    public static getTxDateISO(ctx: Context): string {
        // 1. Get the raw timestamp (Protobuf object) from the stub
        const timestamp = ctx.stub.getTxTimestamp();
        
        // 2. Convert seconds to milliseconds
        // Note: We use Number() because 'seconds' might be a Long object depending on the Fabric version
        const milliseconds = Number(timestamp.seconds) * 1000;

        // 3. Return ISO string
        return new Date(milliseconds).toISOString();
    }
}