console.log(`// This is the case when we
// come across duplicate indexes `);
import { Transaction } from "../transaction";
import { Step, Store } from "../transaction/lib";

const scenario: Step[] = [
    {
        call: async (store: Store) => {
            store.count += 1;
        },
        index: 1,
        meta: {
            description: "call() increases count by 1, restore decreases count by 3",
            title: "valid action with restore",
        },
        restore: async (store: Store) => {
            store.count -= 3;
            console.log("store after last restore():", store);
        },
    },
    {
        call: async (store: Store) => {
            store.count += 1;
        },
        index: 1,
        meta: {
            description: "call() increases count by 1, restore decreases count by 3",
            title: "valid action with restore",
        },
        restore: async (store: Store) => {
            store.count -= 3;
        },
        // Notice how we don"t reach the error about
        // the last step having a restore function
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
