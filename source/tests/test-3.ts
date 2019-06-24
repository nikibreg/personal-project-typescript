console.log(`// This is the case when we skip restore() during rollback
// if restore method 
// in any of the steps is not present`)
import { Transaction } from '../transaction'
import { Store, Step } from '../transaction/lib';

const scenario: Step[] = [
    {
        index: 1,
        meta: {
            title: 'valid action with restore',
            description: 'call() increases count by 1, restore decreases count by 3'
        },
        call: async (store:Store) => {
            store.count += 1
        },
        restore: async (store:Store) => {
            store.count -=3
            console.log('store after last restore():', store)
         }
    },
    {
        index: 2,
        meta: {
            title: 'valid action without restore',
            description: 'it doesn\'t have restore()'
        },
        call: async (store) => {
            store.count += 1
        },
    },
    {
        index: 3,
        meta: {
            title: 'Increment count, expected to throws an error',
            description: 'Expected to be valid last step without restore()'
        },
        call: async (store) => {
            store.count += 1
            throw new Error()
        },
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