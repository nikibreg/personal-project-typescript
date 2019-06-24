console.log(`// This is the case when we 
// come across duplicate indexes `)
import { Transaction } from '../transaction'

const scenario = [
    {
        index: 1,
        meta: {
            title: 'valid action with restore',
            description: 'call() increases count by 1, restore decreases count by 3'
        },
        call: async (store) => {
            store.count += 1
        },
        restore: async (store) => {
            store.count -=3
            console.log('store after last restore():', store)
         }
    },
    {
        index: 1,
        meta: {
            title: 'valid action with restore',
            description: 'call() increases count by 1, restore decreases count by 3'
        },
        call: async (store) => {
            store.count += 1
        },
        restore: async (store) => {
            store.count -=3
         }
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