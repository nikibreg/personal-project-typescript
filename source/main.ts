import { Transaction } from './transaction'
import { Store, Step } from './transaction/lib';

const scenario: Step[] = [
    {
        index: 1,
        meta: {
            title: 'Increment count',
            description: 'This action is expected to be valid'
        },
        call: async (store: Store) => {
            store.count += 1
        },
        restore: async () => { }
    }
];

const transaction = new Transaction();


(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
        console.log('LOGS:', logs)
        console.log('STORE:', store)
    } catch (err) {
        // Send email about broken transaction
        console.log(err)
    }
})();