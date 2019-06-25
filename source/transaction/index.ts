import { Step, Store, Log } from './lib';


// Validates scenario
const validScenario = function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
    let createScenario = descriptor.value;
    descriptor.value = function () {
        let scenario: Step[] = arguments[0]
        for (let step of scenario) {
            if (step.silent) {
                delete step.restore
            }
        }
        // check for duplicate indexes
        let indexes: number[] = scenario.map(step => step.index)
        if (indexes.length !== (new Set(indexes)).size) {
            throw new Error("Duplicate step indexes aren't allowed!")
        }
        // check if last step has a redundant restore()
        if (scenario[scenario.length - 1].restore) {
            throw new Error("Last step shouldn't have a restore function!")
        }
        return createScenario.apply(this, arguments)
    }
}
export class Transaction {
    store: Object | null;
    logs: Array<Log>
    constructor() {
        // We need store to be initialized
        // with a count property (a number)
        // for our tests to work
        // (It's arbitrary, doesn't break anything but tests)
        this.store = { count: 1 }
        this.logs = []
    }

    @validScenario
    createScenario(steps: Step[]) {
        let scenario = steps;
        // Step order according to their index
        return scenario.sort((a: Step, b: Step) => a.index - b.index)
    }

    async dispatch(scenario: Step[]) {
        scenario = this.createScenario(scenario)
        for (let i = 0; i < scenario.length; i++) {
            let step = scenario[i]
            try {
                let storeBefore = { ...this.store }
                await step.call(this.store)
                let storeAfter = { ...this.store }
                this.updateLogs(step, null, storeBefore, storeAfter)
            } catch (error) {
                await this.rollback(scenario)
                this.updateLogs(step, error)
            }
        }
    }

    async rollback(scenario: Step[]) {
        for (let i = scenario.length - 1; i >= 0; --i) {
            let step = scenario[i]
            if (step.restore) {
                await step.restore(this.store)
            }
        }
        this.store = null
    }

    updateLogs(STEP: Step, error?: Error, storeBefore?: Store, storeAfter?: Store) {
        let errored = !(storeBefore && storeAfter)
        let step = { ...STEP }
        delete step.call
        delete step.restore
        if (!errored) {
            this.logs.push({ ...step, storeBefore, storeAfter, error })
        } else {
            this.logs.push({
                ...step,
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            })
        }
    }
}
