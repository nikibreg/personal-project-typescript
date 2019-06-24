console.log(`// This is a test case when we throw an error
// if we see a restore() on the last step`)
import { Transaction } from '../transaction'

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Increment count',
            description: 'This action is expected to be valid'
        },
        call: async (store) => {
            store.count += 1
        },
        restore: async () => { }
    },
    {
        index: 2,
        meta: {
            title: 'Increment count',
            description: 'This action is expected to be valid'
        },
        call: async (store) => {
            store.count += 1
        },
        restore: async () => { }
    },
    {
        index: 3,
        meta: {
            title: 'Increment count',
            description: 'This action is expected to be invalid, since it\'s the last step and has restore()'
        },
        call: async (store) => {
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