import {Simulator} from "./simulator";
import {SetPointType} from "./types";
import * as process from "process";

async function main() {
    const simulator = new Simulator(600, 0);
    const storageSize = process.argv[2] ? Number.parseInt(process.argv[2]) : 0;
    console.log(`Storage size: ${storageSize} Wh`);
    simulator.addStorage(storageSize, SetPointType.CONSUMPTION_PROFILE);
    await simulator.run("800-Watt_35-Degrees.csv", "my_profile", true);
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});