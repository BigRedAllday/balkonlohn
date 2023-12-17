import {SetPoint} from "./setPoint";
import {SetPointType, TStorageProcessResult} from "./types";
import {addMinutes} from "date-fns";

export class Storage {
    private static readonly EFFICIENCY_PERCENT = 90;

    private currentChargeOld: number;
    private currentCharge: number;
    private minimumCharge: number | undefined;
    private maximumCharge: number;
    private readonly sizeWh: number;
    private readonly setPoint: SetPoint;
    private calcMinimumCharge: boolean;

    constructor(sizeWh: number, setPointType: SetPointType, feedInLimit: number, baseLoad: number, powerRefrigerator: number) {
        this.currentCharge = 0;
        this.currentChargeOld = 0;
        this.sizeWh = sizeWh;
        this.maximumCharge = 0;
        this.calcMinimumCharge = false;
        this.setPoint = new SetPoint(setPointType, feedInLimit, baseLoad, powerRefrigerator);
    }

    process(date: Date, feedInWh: number, consumptionWh: number) : TStorageProcessResult {

        const dateRightAligned = addMinutes(date, 15);
        const setPointWatt = this.setPoint.getCurrentSetPoint(dateRightAligned, consumptionWh * 4);
        const setPointWh = setPointWatt / 4;
        const newFeedIn = this.addOrRemoveFromStorage(feedInWh, setPointWh);

        return {
            newFeedIn,
            setPointWh,
            oldBatteryCharge: this.currentChargeOld,
            newBatteryCharge: this.currentCharge
        }
    }

    private addOrRemoveFromStorage(feedInWh: number, setPointWh: number) : number {
        this.currentChargeOld = this.currentCharge;
        if (feedInWh > setPointWh) {
            const addedToStorage = this.addToStorage(feedInWh - setPointWh);
            return feedInWh - addedToStorage;
        } else {
            const removedFromStorage = this.removeFromStorage(setPointWh - feedInWh);
            return feedInWh + removedFromStorage;
        }
    }

    private addToStorage(amountWattWh: number) : number {

        this.currentCharge = this.currentCharge + amountWattWh;
        if (this.currentCharge > this.sizeWh) {
            this.currentCharge = this.sizeWh;
        }

        if (this.currentCharge > this.sizeWh / 2) {
            this.calcMinimumCharge = true;
        }

        if (this.currentCharge > this.maximumCharge) {
            this.maximumCharge = this.currentCharge;
        }

        return this.currentCharge - this.currentChargeOld;
    }

    private removeFromStorage(amountWattWh: number) : number {
        // const energyWithEfficiencyLoss = amountWattWh * (100 / Storage.EFFICIENCY_PERCENT);
        this.subtractFromCurrentCharge(amountWattWh);

        const newFeedIn = this.currentCharge !== 0 ? this.currentChargeOld - this.currentCharge : this.currentChargeOld * Storage.EFFICIENCY_PERCENT / 100;

        const efficiencyLoss = amountWattWh * (1 - (Storage.EFFICIENCY_PERCENT / 100));
        this.subtractFromCurrentCharge(efficiencyLoss);

        if (this.calcMinimumCharge && (this.minimumCharge === undefined || this.currentCharge < this.minimumCharge)) {
            this.minimumCharge = Math.max(this.currentCharge, 0);
        }

        return newFeedIn;
    }

    private subtractFromCurrentCharge(amountWh: number) {
        this.currentCharge = this.currentCharge - amountWh;

        if (this.currentCharge < 0) {
            this.currentCharge = 0;
        }
    }

    getMinimumCharge() {
        return this.minimumCharge;
    }

    getMaximumCharge() {
        return this.maximumCharge;
    }

    public getSetPointType() : SetPointType {
        return this.setPoint.getSetPointType();
    }
}