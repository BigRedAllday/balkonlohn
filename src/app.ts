import {Simulator} from "./simulator";

async function main() {
    const simulator = new Simulator();
    await simulator.run("600-Watt_35-Degrees.csv");
}


//Invoke the main function
main().catch(err => {
    console.log(err);
});
