import {Simulator} from "./simulator";

async function main() {
    const simulator = new Simulator();
    await simulator.run("angles/800");
}


//Invoke the main function
main().catch(err => {
    console.log(err);
});
