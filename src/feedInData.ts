import fs from "fs";
import {TFeedInMetadata} from "./types";

export class FeedInData {

    private feedInData: Map<string, number>;

    constructor() {
        this.feedInData = new Map();
    }

    loadFeedInData(path: string) : TFeedInMetadata {
        const fileContent = fs.readFileSync(path, "utf8");
        let slope: number | undefined;
        let azimuth: number | undefined;
        let peakPowerKw: number | undefined;
        let systemLossPercent: number | undefined;

        for (const line of fileContent.split("\n")) {
            if (line.startsWith("20")) {
                const values = line.split(",");
                const timeParts = values[0].split(":");
                const hour = Number.parseInt(timeParts[1].substring(0, 2));
                const month = Number.parseInt(timeParts[0].substring(4, 6));
                const day = Number.parseInt(timeParts[0].substring(6, 8));

                const wattHours = Number.parseFloat(values[1]);
                const wattQuarterHour = wattHours / 4;
                this.feedInData.set(`${month}.${day}.${hour}.0`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.15`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.30`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.45`, wattQuarterHour);
            } else if (line.startsWith("Slope")) {
                // e.g. Slope: 90 deg.
                const match = line.match(/Slope: (\d+) deg\./);
                slope = match ? parseInt( match[1]) : undefined;;
            } else if (line.startsWith("Azimuth")) {
                // eg. Azimuth: 0 deg.
                const match = line.match(/Azimuth: (\d+) deg\./);
                azimuth = match ? parseInt( match[1]) : undefined;;
            } else if (line.startsWith("Nominal power of the PV system")) {
                // e.g. Nominal power of the PV system (c-Si) (kWp):	0.3
                peakPowerKw = parseInt(line.split(":")[1]!.trim());
            } else if (line.startsWith("System losses")) {
                // e.g. System losses (%):	8.0
                systemLossPercent = parseInt( line.split(":")[1]!.trim());
            }
        }

        if (slope !== undefined && azimuth !== undefined && peakPowerKw !== undefined && systemLossPercent !== undefined) {
            return {
                azimuth,
                slope,
                systemLossPercent,
                peakPowerKw
            }
        } else {
            throw Error("Unable to parse metadata");
        }
    }

    getFeedIn(date: Date) : number {
        const key = `${date.getMonth() + 1}.${date.getDate()}.${date.getHours()}.${date.getMinutes()}`;
        const result = this.feedInData.get(key)!;
        if (result == undefined) {
            throw new Error(`feed in not found for key ${key}`);
        }
        return result;
    }
}