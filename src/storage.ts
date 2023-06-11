export class Storage {
    private static readonly EFFICIENCY_PERCENT = 80;
    private static readonly INITIAL_CHARGE = 30;

    private currentCharge: number;
    private readonly sizeWh: number;
    private readonly isActivated: boolean;

    constructor(isActivated: boolean, sizeWh: number) {
        this.currentCharge = Storage.INITIAL_CHARGE;
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
            if (this.isActivated) {
                console.log("Storage is empty");
            }
        }
    }
}