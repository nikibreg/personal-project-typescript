import { Log, Step, Store } from "./lib";

// Validates scenario
const validScenario = (target: Transaction, propertyKey: string, descriptor: PropertyDescriptor): void => {
    const createScenario = descriptor.value;
    descriptor.value = function() {
        const scenario: Step[] = arguments[0];
        for (const step of scenario) {
            if (step.silent) {
                delete step.restore;
            }
        }
        // check for duplicate indexes
        const indexes: number[] = scenario.map((step: Step) => step.index);
        if (indexes.length !== (new Set(indexes)).size) {
            throw new Error("Duplicate step indexes aren't allowed!");
        }
        // check if last step has a redundant restore()
        if (scenario[scenario.length - 1].restore) {
            throw new Error("Last step shouldn't have a restore function!");
        }
        return createScenario.apply(this, arguments);
    };
};
export class Transaction {
    public store: Store | null;
    public logs: Log[];
    constructor() {
        // We need store to be initialized
        // with a count property (a number)
        // for our tests to work
        // (It's arbitrary, doesn't break anything but tests)
        this.store = { count: 1 };
        this.logs = [];
    }

    public async dispatch(scenario: Step[]) {
        scenario = this.createScenario(scenario);
        for (const step of scenario) {
            try {
                const storeBefore = { ...this.store };
                await step.call(this.store);
                const storeAfter = { ...this.store };
                this.updateLogs(step, null, storeBefore, storeAfter);
            } catch (error) {
                await this.rollback(scenario);
                this.updateLogs(step, error);
            }
        }
    }

    @validScenario
    private createScenario(steps: Step[]) {
        const scenario = steps;
        // Step order according to their index
        return scenario.sort((a: Step, b: Step) => a.index - b.index);
    }

    private async rollback(scenario: Step[]) {
        for (let i = scenario.length - 1; i >= 0; --i) {
            const step = scenario[i];
            if (step.restore) {
                await step.restore(this.store);
            }
        }
        this.store = null;
    }

    private updateLogs(STEP: Step, error: Error | null, storeBefore?: Store | null, storeAfter?: Store | null) {
        const errored = !(storeBefore && storeAfter);
        const step = { ...STEP };
        delete step.call;
        delete step.restore;
        if (!errored) {
            this.logs.push({ ...step, storeBefore, storeAfter, error});
        } else {
            if (error instanceof Error) {
                this.logs.push({
                    ...step,
                    error: {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                    },
                });
            }
        }
    }
}
