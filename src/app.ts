import {Simulator} from "./simulator";

async function main() {
    const simulator = new Simulator();
    simulator.run();
}


//Invoke the main function
main().catch(err => {
    console.log(err);
});
