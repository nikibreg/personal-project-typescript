import { Transaction } from './transaction'

const scenario = [];

const transaction = new Transaction();
(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []
    } catch (err) {
        // Send email about broken transaction
        console.log(err)
    }
})();