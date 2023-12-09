import {Simulator} from "./simulator";
import {SetPointType} from "./types";
import * as process from "process";

async function main() {
    const simulator = new Simulator(800, 130, 1);
    const storageSize = process.argv[2] ? Number.parseInt(process.argv[2]) : 0;
    console.log(`Storage size: ${storageSize} Wh`);
    simulator.addStorage(storageSize, SetPointType.CONSUMPTION_PROFILE);
    await simulator.run("after_burner/Timeseries_53.649_9.704_SA2_1kWp_crystSi_10_90deg_-90deg_2020_2020.csv",
        "my_profile", false);
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});