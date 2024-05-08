import * as fs from "fs";
import * as path from "path";
import { TonClient4 } from "ton";
import { getHttpEndpoint } from '@orbs-network/ton-access';
import { Address, contractAddress, toNano } from "@ton/core";
import { SampleTactContract } from "./output/sample_SampleTactContract";
import { prepareTactDeployment } from "@tact-lang/deployer";
import { TonClient } from '@ton/ton';
import { NetworkProvider, sleep } from '@ton/blueprint';

(async () => {

    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({ endpoint });


    // const client = new TonClient4({
    //     endpoint: "https://sandbox-v4.tonhubapi.com", // 🔴 Test-net API endpoint
    // });

    // Parameters

    let testnet = true;
    let packageName = "sample_SampleTactContract.pkg";
    let owner = Address.parse("0QBP-w_1z8mBh2yDi4EwHUcg-WSM_nT3p07zcpIRnwtEbCUX");
    let init = await SampleTactContract.init(owner);
    let contract_address = contractAddress(0, init);

    // Prepareing
    console.log("Reading Contract Info...");
    console.log(contract_address);

    // Input the contract address
    let contract = await SampleTactContract.fromAddress(contract_address);
    console.log(typeof contract, contract);
    let contract_open = client.open(contract);
    // console.log("Counter Value: " + (await contract_open.getCounter()));
    let value =  await contract_open.getCounter();
    const state  = await contract_open.getState();
    console.log(value, state);

    // const increase = await contract_open.send(owner, { value: toNano(1) }, "increment");
    // console.log(value, state);
})();
