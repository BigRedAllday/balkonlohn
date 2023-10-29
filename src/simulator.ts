import {ConsumptionProfile} from "./consumptionProfile";
import {FeedInData} from "./feedInData";
import fs from "fs";
import path from 'path';
import {Storage} from "./storage";
import {SetPointType} from "./types";

export class Simulator {

    private readonly feedInLimit: number;
    private readonly baseLoadIncrease: number;
    private readonly profileFactor: number;

    constructor(feedInLimit: number, baseLoadIncrease: number, profileFactor: number) {
        this.feedInLimit = feedInLimit;
        this.baseLoadIncrease = baseLoadIncrease;
        this.profileFactor = profileFactor;
    }

    private storage: Storage | undefined;

    public addStorage(storageSizeWh: number, setPointType: SetPointType) {
        this.storage = new Storage(storageSizeWh, setPointType, this.feedInLimit, this.baseLoadIncrease);
    }

    public async run(fileOrDirectory: string, profileName: string, isLoggingEnabled: boolean) {
        // Load Profiles
        const profile = new ConsumptionProfile();
        profile.loadProfiles(profileName);

        const fullPath = `./feedin/${fileOrDirectory}`;
        const isDirectory = await this.isDirectory(fullPath);

        const allFiles = isDirectory ? await this.getFilesInDirectory(fullPath) : [fullPath];

        for (const file of allFiles) {
            const feedInData = new FeedInData();
            const feedInMetaData = feedInData.loadFeedInData(file);
            console.log(`Simulating with ${JSON.stringify(feedInMetaData)}`);

            // Variables needed by year-iteration
            const start = new Date('2022-12-31T23:00:00.000Z');
            const end = new Date('2023-12-31T22:45:00.000Z');
            const quarterHour = 1000 * 60 * 15; // in Millisekunden

            // Counter
            let totalConsumption = 0;
            let totalProduction = 0;
            let totalSelfConsumption = 0;

            const fileName = path.parse(file).name;
            const setPoint = this.storage ? SetPointType[this.storage.getSetPointType()] : "no-storage";
            const logFileName = `log-${fileName}-${setPoint}.csv`;
            if (isLoggingEnabled) {
                fs.writeFileSync(logFileName, 'time;consumption;feedInSolar;newFeedIn;selfConsumption;setPoint;oldCharge;newCharge;difference\r\n');
            }

            for (let current = start.getTime(); current <= end.getTime(); current += quarterHour) {
                const currentTime = new Date(current);
                const consumption = (profile.getConsumption(currentTime) + this.baseLoadIncrease / 4) * this.profileFactor;

                const feedInFromSolar = feedInData.getFeedIn(currentTime);
                const storageProcessResult = this.storage?.process(currentTime, feedInFromSolar, consumption)
                const feedInAfterStorage = storageProcessResult ? storageProcessResult.newFeedIn : feedInFromSolar;

                const feedIn = Math.min(feedInAfterStorage, this.feedInLimit);
                const selfConsumption = Math.min(consumption, feedIn);

                totalConsumption = totalConsumption + consumption;
                totalProduction = totalProduction + feedInFromSolar;
                totalSelfConsumption = totalSelfConsumption + selfConsumption;

                if (isLoggingEnabled) {
                    const line = `${currentTime};`.concat(
                        `${consumption.toFixed(2)};`,
                        `${feedInFromSolar.toFixed(2)};`,
                        `${feedInAfterStorage.toFixed(2)};`,
                        `${selfConsumption.toFixed(2)};`,
                        `${storageProcessResult ? storageProcessResult.setPointWh : "-"};`,
                        `${storageProcessResult ? storageProcessResult.oldBatteryCharge.toFixed(2) : "-"};`,
                        `${storageProcessResult ? storageProcessResult.newBatteryCharge.toFixed(2) : "-"};`,
                        `${storageProcessResult ? (storageProcessResult.newBatteryCharge - storageProcessResult.oldBatteryCharge).toFixed(2) : "-"};`
                    );

                    fs.appendFileSync(logFileName, `${line}\r\n`);
                }
            }

            if (!isDirectory) {
                console.log(`Jahresverbrauch laut Profil (kWh): ${totalConsumption / 1000}`);
                console.log(`Produktion gesamt (kWh): ${totalProduction / 1000}`);
                console.log(`Eigenverbrauch (kWh): ${totalSelfConsumption / 1000}`);
                if (this.storage) {
                    console.log(`Geringster Speicherstand (Wh): ${this.storage.getMinimumCharge()}`);
                    console.log(`Größter Speicherstand (Wh): ${this.storage.getMaximumCharge()}`);
                }
            } else {
                const fileName = `Azimuth-${feedInMetaData.azimuth}.csv`;
                const existed = fs.existsSync(fileName);
                if (!existed) {
                    fs.writeFileSync(fileName, 'slope;own;sum\r\n');
                }
                fs.appendFileSync(fileName, `${feedInMetaData.slope};${(totalSelfConsumption / 1000).toFixed(3)};${(totalProduction / 1000).toFixed(3)}\r\n`);
                // console.log(`Added values to ${existed ? "existing" : "new"} file ${fileName}`);
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