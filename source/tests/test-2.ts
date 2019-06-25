console.log(`// This is a test case when we throw an error
// if we see a restore() on the last step`);
import { Transaction } from "../transaction";
import { Step, Store } from "../transaction/lib";

const scenario: Step[] = [
    {
        call: async (store) => {
            if (store !== null) {
                store.count += 1;
            }
        },
        index: 1,
        meta: {
            description: "This action is expected to be valid",
            title: "Increment count",
        },
        restore: async () => {/**/},
    },
    {
        call: async (store: Store) => {
            store.count += 1;
        },
        index: 2,
        meta: {
            description: "This action is expected to be valid",
            title: "Increment count",
        },
        restore: async () => {/**/},
    },
    {
        call: async (store: Store) => {
            store.count += 1;
        },
        index: 3,
        meta: {
            description: "This action is expected to be invalid, since it\"s the last step and has restore()",
            title: "Increment count",
        },
        restore: async () => {/**/},
    },
];

const transaction = new Transaction();
(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log("LOGS:", logs);
        console.log("STORE:", store);
    } catch (err) {
        // Send email about broken transaction
        console.log(err);
    }
})();
