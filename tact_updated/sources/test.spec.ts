import { toNano, beginCell } from "@ton/ton";
import {
    Blockchain,
    SandboxContract,
    TreasuryContract,
    printTransactionFees,
    prettyLogTransactions,
} from "@ton/sandbox";
import "@ton/test-utils";
import { printSeparator } from "./utils/print";
import { NftCollection, RoyaltyParams, loadEventMintRecord } from "./output/sample_NftCollection";
import { NftItem } from "./output/sample_NftItem";

describe("contract", () => {
    const OFFCHAIN_CONTENT_PREFIX = 0x01;
    const string_first = "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/";
    let newContent = beginCell().storeInt(OFFCHAIN_CONTENT_PREFIX, 8).storeStringRefTail(string_first).endCell();

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let collection: SandboxContract<NftCollection>;

    beforeAll(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury("deployer");

        console.log('deployer address', deployer.address, deployer.getSender())

        let royaltiesParam: RoyaltyParams = {
            $$type: "RoyaltyParams",
            numerator: 350n, // 350n = 35%
            denominator: 1000n,
            destination: deployer.address,
        };

        collection = blockchain.openContract(
            await NftCollection.fromInit(deployer.address, newContent, royaltiesParam)
        );
    });

    it("Test", async () => {
        // console.log("Next IndexID: " + (await collection.getGetCollectionData()).next_item_index);
        // console.log("Collection Address: " + collection.address);
    });

    it("Test Mint Record in detail", async () => {
        const add_white_result = await collection.send(deployer.getSender(), { value: toNano(1) }, "AddWhitelist");
        printTransactionFees(add_white_result.transactions);
        prettyLogTransactions(add_white_result.transactions);
        
        const mint_result = await collection.send(deployer.getSender(), { value: toNano(1) }, "Mint"); // Send Mint Transaction
        printTransactionFees(mint_result.transactions);
        prettyLogTransactions(mint_result.transactions);
    });

    it("should deploy correctly", async () => {
        await collection.send(deployer.getSender(), { value: toNano(1) }, "AddWhitelist");
        await collection.send(deployer.getSender(), { value: toNano(2) }, "Mint");

        let current_index = (await collection.getGetCollectionData()).next_item_index;
        const deploy_result = await collection.send(deployer.getSender(), { value: toNano(1) }, "Mint"); // Send Mint Transaction
        expect(deploy_result.transactions).toHaveTransaction({
            from: deployer.address,
            to: collection.address,
            success: true,
        });
        let next_index = (await collection.getGetCollectionData()).next_item_index;
        expect(next_index).toEqual(current_index + 1n);
        printSeparator();

        console.log("External Message(string - base64): " + deploy_result.externals[0].body.toBoc().toString("base64"));
        console.log("External Message(string - hex): " + deploy_result.externals[0].body.toBoc().toString("hex"));
        printSeparator();

        let loadEvent = loadEventMintRecord(deploy_result.externals[0].body.asSlice());
        console.log("ItemId: " + loadEvent.item_id);
        console.log("Number: " + loadEvent.generate_number);
    });
});
