import {Simulator} from "./simulator";
import {SetPointType} from "./types";
import * as process from "process";

async function main() {
    const simulator = new Simulator(800, 0, 1);
    const storageSize = process.argv[2] ? Number.parseInt(process.argv[2]) : 0;
    console.log(`Storage size: ${storageSize} Wh`);
    simulator.addStorage(storageSize, SetPointType.CONSUMPTION_PROFILE);
    await simulator.run("miaAndPaul/1000-Watt_35-Degrees_Emden.csv", "paul_mia", false);
}

//Invoke the main function
main().catch(err => {
    console.log(err);
});