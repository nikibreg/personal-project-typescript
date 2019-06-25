console.log(`// This is the case when we skip restore() during rollback
// if restore method
// in any of the steps is not present`);
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
        call: async (store) => {
            if (store != null) {
                store.count += 1;
            }
        },
        index: 2,
        meta: {
            description: "it doesn\"t have restore()",
            title: "valid action without restore",
        },
    },
    {
        call: async (store) => {
            if (store) {
                store.count += 1;
            }
            throw new Error();
        },
        index: 3,
        meta: {
            description: "Expected to be valid last step without restore()",
            title: "Increment count, expected to throws an error",
        },
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
