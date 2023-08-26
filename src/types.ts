export enum TimeOfYear {
    SUMMER,
    WINTER,
    SPRING_AUTUMN
}

export enum Day {
    WORKING_DAY,
    SATURDAY,
    SUNDAY
}

export type TValue = {
    hour: number;
    minute: number;
    value: number;
}

export type TTimeOfYear = {
    timeOfYear: TimeOfYear;
    days: Map<Day, TValue[]>;
};

export type TFeedInMetadata = {
    azimuth: number,
    slope: number,
    peakPowerKw: number,
    systemLossPercent: number
}

export type TStorageProcessResult = {
    newFeedIn: number,
    setPointWh: number,
    oldBatteryCharge: number,
    newBatteryCharge: number
}

export enum SetPointType {
    CONSUMPTION_PROFILE,
    BASE_LOAD,
    BASE_LOAD_PLUS_PRIME_TIME_150W,
    CONTINUOUS_50W,
    CONTINUOUS_100W,
    CONTINUOUS_200W
}