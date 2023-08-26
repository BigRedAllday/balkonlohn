import {SetPointType} from "./types";

export class SetPoint {

    private readonly setPointType: SetPointType;
    private readonly feedInLimit: number;
    private readonly baseLoadIncrease: number;

    private readonly BASE_LOAD = 26;
    private readonly REFRIGERATOR = 90;

    constructor(setPointType: SetPointType, feedInLimit: number, baseLoadIncrease: number) {
        this.setPointType = setPointType;
        this.feedInLimit = feedInLimit;
        this.baseLoadIncrease = baseLoadIncrease;
    }

    public getSetPointType() : SetPointType {
        return this.setPointType;
    }

    getCurrentSetPoint(currentTimeLeftAligned: Date, currentProfileValueWatt: number) {

        switch (this.setPointType) {
            case SetPointType.CONSUMPTION_PROFILE:
                return Math.min(currentProfileValueWatt, this.feedInLimit);
            case SetPointType.CONTINUOUS_50W:
                return Math.min(50, this.feedInLimit);
            case SetPointType.CONTINUOUS_100W:
                return Math.min(100, this.feedInLimit);
            case SetPointType.CONTINUOUS_200W:
                return Math.min(200, this.feedInLimit);
            case SetPointType.BASE_LOAD:
                return Math.min(this.getBaseLoad(currentTimeLeftAligned), this.feedInLimit);
            case SetPointType.BASE_LOAD_PLUS_PRIME_TIME_150W:
                if (currentTimeLeftAligned.getHours() >= 18 && currentTimeLeftAligned.getHours() <= 23) {
                    return Math.min(this.getBaseLoad(currentTimeLeftAligned) + 150, this.feedInLimit);
                } else {
                    return Math.min(this.getBaseLoad(currentTimeLeftAligned), this.feedInLimit);
                }
        }
    }

    private getBaseLoad(currentTime: Date) : number {
        if (currentTime.getHours() === 0 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 1 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 1 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 2 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 3 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 4 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 4 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 5 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 6 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 7 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 7 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 8 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 9 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 10 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 10 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 11 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 12 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 13 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 13 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 14 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 15 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 16 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 16 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 17 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 18 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 19 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 19 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 20 && currentTime.getMinutes() === 30 ||
            currentTime.getHours() === 21 && currentTime.getMinutes() === 15 ||
            currentTime.getHours() === 22 && currentTime.getMinutes() === 0 ||
            currentTime.getHours() === 22 && currentTime.getMinutes() === 45 ||
            currentTime.getHours() === 23 && currentTime.getMinutes() === 30) {
            return this.BASE_LOAD + this.REFRIGERATOR + this.baseLoadIncrease;
        } else {
            return this.BASE_LOAD + this.baseLoadIncrease;
        }
    }
}