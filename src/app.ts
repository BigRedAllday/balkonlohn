import {ConsumptionProfile} from "./consumptionProfile";
import {FeedInData} from "./feedInData";

async function main() {
    // Feed in is limited for example by inverter power
    const feedInLimit = 600;

    // Load Profiles
    const profile = new ConsumptionProfile();
    profile.loadProfiles("my_profile");
    const feedInData = new FeedInData();
    feedInData.loadFeedInData("830-Watt_35-Degrees.csv");

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
        const consumption = profile.getConsumption(currentTime);
        const feedIn = Math.min(feedInData.getFeedIn(currentTime), feedInLimit);
        totalConsumption = totalConsumption + consumption;
        totalProduction = totalProduction + feedIn;
        selfConsumption = selfConsumption + Math.min(consumption, feedIn);
    }

    console.log(`Jahresverbrauch laut Profil (kWh): ${totalConsumption / 1000}`);
    console.log(`Produktion gesamt (kWh): ${totalProduction / 1000}`);
    console.log(`Eigenverbrauch (kWh): ${selfConsumption / 1000}`);
}


//Invoke the main function
main().catch(err => {
    console.log(err);
});