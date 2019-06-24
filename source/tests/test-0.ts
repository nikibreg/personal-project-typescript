console.log(`// This is a case when we have an invalid 
// type for a property
`)

import { Transaction } from '../transaction'

const scenario = [
    {
        index: '1',
        meta: {
            title: 'Increment count',
            description: 'This action is expected to be valid'
        },
        call: async (store) => {
            store.count += 1
        },
        restore: async () => { }
        // Notice, how we don't reach error 
        // about last step having restore()
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