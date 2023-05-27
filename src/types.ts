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