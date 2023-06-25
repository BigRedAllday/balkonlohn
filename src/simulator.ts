import {ConsumptionProfile} from "./consumptionProfile";
import {FeedInData} from "./feedInData";
import fs from "fs";
import path from 'path';

export class Simulator {
    public async run(fileOrDirectory: string) {
        // Feed in is limited for example by inverter power
        const feedInLimit = 600;
        const baseLoadIncrease = 0;

        // Load Profiles
        const profile = new ConsumptionProfile();
        profile.loadProfiles("my_profile");

        const fullPath = `./feedin/${fileOrDirectory}`;
        const isDirectory = await this.isDirectory(fullPath);

        const allFiles = isDirectory ? await this.getFilesInDirectory(fullPath) : [fullPath];

        for (const file of allFiles) {
            const feedInData = new FeedInData();
            const feedInMetaData = feedInData.loadFeedInData(file);
            console.log(`Simulating with ${JSON.stringify(feedInMetaData)}`);

            // Variables needed by year-iteration
            const start = new Date('2023-01-01T00:00:00.000Z');
            const end = new Date('2023-12-31T23:00:00.000Z');
            const quarterHour = 1000 * 60 * 15; // in Millisekunden

            // Counter
            let totalConsumption = 0;
            let totalProduction = 0;
            let selfConsumption = 0;

            for (let current = start.getTime(); current <= end.getTime(); current += quarterHour) {
                const currentTime = new Date(current);
                const consumption = profile.getConsumption(currentTime) + baseLoadIncrease / 4;
                const feedIn = Math.min(feedInData.getFeedIn(currentTime), feedInLimit);
                totalConsumption = totalConsumption + consumption;
                totalProduction = totalProduction + feedIn;
                selfConsumption = selfConsumption + Math.min(consumption, feedIn);
            }

            if (!isDirectory) {
                console.log(`Jahresverbrauch laut Profil (kWh): ${totalConsumption / 1000}`);
                console.log(`Produktion gesamt (kWh): ${totalProduction / 1000}`);
                console.log(`Eigenverbrauch (kWh): ${selfConsumption / 1000}`);
            } else {
                throw Error("Not implemented yet");
            }
        }
    }

    private isDirectory(path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            fs.lstat(path, (err, stats) => {
                if (err) {
                    reject("Error reading file");
                } else {
                    if (stats.isFile()) {
                        resolve(false);
                    } else if (stats.isDirectory()) {
                        resolve(true);
                    } else {
                        reject("File neither directory nor file");
                    }
                }
            });
        });
    }

    private getFilesInDirectory(directoryPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readdir(directoryPath, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    const filePaths: string[] = [];

                    files.forEach((file) => {
                        const filePath = path.join(directoryPath, file);
                        filePaths.push(filePath);
                    });

                    resolve(filePaths);
                }
            });
        });
    }
}