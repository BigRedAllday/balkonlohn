import fs from "fs";

export class FeedInData {

    private feedInData: Map<string, number>;

    constructor() {
        this.feedInData = new Map();
    }

    loadFeedInData(filename: string) {
        const fileContent = fs.readFileSync(`./feedin/${filename}`, "utf8");
        let debug = 0;

        for (const line of fileContent.split("\n")) {
            if (line.startsWith("20")) {
                const values = line.split(",");
                const timeParts = values[0].split(":");
                const hour = Number.parseInt(timeParts[1].substring(0, 2));
                const month = Number.parseInt(timeParts[0].substring(4, 6));
                const day = Number.parseInt(timeParts[0].substring(6, 8));

                const wattHours = Number.parseFloat(values[1]);
                debug = debug + wattHours;
                const wattQuarterHour = wattHours / 4;
                this.feedInData.set(`${month}.${day}.${hour}.0`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.15`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.30`, wattQuarterHour);
                this.feedInData.set(`${month}.${day}.${hour}.45`, wattQuarterHour);
            }
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