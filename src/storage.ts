export class Storage {
    private static readonly EFFICIENCY_PERCENT = 80;
    private static readonly INITIAL_CHARGE = 30;

    private currentCharge: number;
    private minimumCharge: number;
    private readonly sizeWh: number;
    private readonly isActivated: boolean;

    constructor(isActivated: boolean, sizeWh: number) {
        this.currentCharge = Storage.INITIAL_CHARGE;
        this.minimumCharge = this.currentCharge;
        this.sizeWh = sizeWh;
        this.isActivated = isActivated;
    }

    put(amountWatt: number, timespanHours: number) {
        this.currentCharge = this.currentCharge + (amountWatt * timespanHours);
        if (this.currentCharge > this.sizeWh) {
            this.currentCharge = this.sizeWh;
        }
    }

    get(amountWatt: number, timespanHours: number) {
        const energyWithEfficiencyLoss = (amountWatt * timespanHours) * (100 / Storage.EFFICIENCY_PERCENT);
        this.currentCharge = this.currentCharge - energyWithEfficiencyLoss;
        if (this.currentCharge < 0) {
            this.currentCharge = 0;
        }
        if (this.currentCharge < this.minimumCharge) {
            this.minimumCharge = this.currentCharge;
        }
    }

    getMinimumCharge() {
        return this.minimumCharge;
    }

    getIsActivated() {
        return this.isActivated;
    }
}