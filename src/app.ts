import {Simulator} from "./simulator";
import {SetPointType} from "./types";
import * as process from "process";

async function main() {
    const simulator = new Simulator(800, 130, 1);
    const storageSize = process.argv[2] ? Number.parseInt(process.argv[2]) : 0;
    console.log(`Storage size: ${storageSize} Wh`);
    simulator.addStorage(storageSize, SetPointType.CONSUMPTION_PROFILE, 25);
    await simulator.run("after_burner/1000-Watt_40-Degrees.csv",
        "my_profile", false);
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});