import * as fs from "fs";
import {Day, TimeOfYear, TTimeOfYear} from "./types";
import Holidays from 'date-holidays';
import { addMinutes } from 'date-fns'

export class ConsumptionProfile {
    private h0Profile: Map<TimeOfYear, TTimeOfYear>;
    private holidays;
    private readonly seasonMonthFrom?: number;
    private readonly seasonMonthTo?: number;

    constructor(seasonMonthFromZeroBased?: number, seasonMonthToZeroBased?: number) {
        this.h0Profile = new Map();
        this.holidays = new Holidays("DE");
        this.seasonMonthFrom = seasonMonthFromZeroBased;
        this.seasonMonthTo = seasonMonthToZeroBased;
    }

    loadProfiles(profileFolder: string) {
        const winterProfile = ConsumptionProfile.loadProfileOfTimeOfYear(TimeOfYear.WINTER,
            `./profiles/${profileFolder}/winter.csv`);
        this.h0Profile.set(TimeOfYear.WINTER, winterProfile);

        const summerProfile = ConsumptionProfile.loadProfileOfTimeOfYear(TimeOfYear.SUMMER,
            `./profiles/${profileFolder}/summer.csv`);
        this.h0Profile.set(TimeOfYear.SUMMER, summerProfile);

        const springAutumnProfile = ConsumptionProfile.loadProfileOfTimeOfYear(TimeOfYear.SPRING_AUTUMN,
            `./profiles/${profileFolder}/springautumn.csv`);
        this.h0Profile.set(TimeOfYear.SPRING_AUTUMN, springAutumnProfile);
    }

    getConsumption(leftAlignedDate: Date) : number {

        const rightAlignedDate = addMinutes(leftAlignedDate, 15);

        if (this.seasonMonthFrom && rightAlignedDate.getMonth() < this.seasonMonthFrom) {
            return 0;
        }

        if (this.seasonMonthTo && rightAlignedDate.getMonth() > this.seasonMonthTo) {
            return 0;
        }

        const march21st = new Date(rightAlignedDate.getFullYear(), 2, 21);
        const may15th = new Date(rightAlignedDate.getFullYear(), 4, 15);
        const september15th = new Date(rightAlignedDate.getFullYear(), 8, 15);
        const november1st = new Date(rightAlignedDate.getFullYear(), 10, 1);

        // get time of year
        let timeOfYear: TimeOfYear;
        if (rightAlignedDate.getTime() < march21st.getTime()) {
            timeOfYear = TimeOfYear.WINTER;
        } else if (rightAlignedDate.getTime() < may15th.getTime()) {
            timeOfYear = TimeOfYear.SPRING_AUTUMN;
        } else if (rightAlignedDate.getTime() < september15th.getTime()) {
            timeOfYear = TimeOfYear.SUMMER;
        } else if (rightAlignedDate.getTime() < november1st.getTime()) {
            timeOfYear = TimeOfYear.SPRING_AUTUMN;
        } else {
            timeOfYear = TimeOfYear.WINTER;
        }

        // get day
        let day: Day;
        if (this.holidays.isHoliday(rightAlignedDate) || rightAlignedDate.getDay() === 0) {
            day = Day.SUNDAY;
        } else if ( rightAlignedDate.getDay() === 6) {
            day = Day.SATURDAY;
        } else {
            day = Day.WORKING_DAY;
        }

        const valuesOfDay = this.h0Profile.get(timeOfYear)!.days.get(day);
        const value = valuesOfDay!.find(v => v.hour === rightAlignedDate.getHours()
            && v.minute === rightAlignedDate.getMinutes());

        return value!.value / 4;
    }

    private static loadProfileOfTimeOfYear(timeOfYear: TimeOfYear, path: string) : TTimeOfYear {
        const fileContent = fs.readFileSync(path, 'utf8');

        const profile: TTimeOfYear = {
            timeOfYear,
            days: new Map([
                [Day.WORKING_DAY, []],
                [Day.SATURDAY, []],
                [Day.SUNDAY, []],
            ])
        };

        for (const line of fileContent.split("\n")) {
            // skip header
            if (!line.startsWith(";") && line.trim().length > 0) {
                const values = line.split(";");
                if (values.length == 4) {
                    const hour = +values[0]!.split(":")[0];
                    const minute = +values[0]!.split(":")[1];
                    profile.days.get(Day.SATURDAY)!.push({
                        hour,
                        minute,
                        value: Number.parseFloat(values[1].replace(",", "."))
                    });
                    profile.days.get(Day.SUNDAY)!.push({
                        hour,
                        minute,
                        value: Number.parseFloat(values[2].replace(",", "."))
                    });
                    profile.days.get(Day.WORKING_DAY)!.push({
                        hour,
                        minute,
                        value: Number.parseFloat(values[3].trimEnd().replace(",", "."))
                    });
                }
            }
        }
        return profile;
    }
}