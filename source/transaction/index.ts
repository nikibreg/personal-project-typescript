import { Validator } from '../validator'
export class Transaction {
    constructor() {
        this.logs = []
        // We need store to be initialized
        // with a count property (a number)
        // for our tests to work
        this.store = {count: 1}
        // (It's arbitrary, doesn't break anything but tests)
        this.schema = {
            index: {
                type: 'number'
            },
            meta: {
                title: {
                    type: 'string'
                },
                description: {
                    type: 'string'
                }
            },
            call: {
                type: 'function'
            },
            restore: {
                type: 'function',
                optional: true
            },
            silent: {
                type: 'boolean',
                optional: true
            }
        }
    }

    // validation against multiple requirements for a list of steps 
    validSteps(...steps){
        // validate individual steps
        for (let step of steps) {
            let isValid = Validator.validate(step, this.schema)
            let isObject = (typeof step == "object")
            let isMetaValid = step.meta && step.meta.title && step.meta.description
            if (!isValid || !(!!isObject && !!step.index && !!step.call && isMetaValid)){
                throw new Error("Invalid Step!!!")
            }
            if (step.silent){
                delete step.restore
            }
        }
        // check for duplicate indexes
        let indexes = steps.map(step=>step.index)
        if ((new Set(indexes)).size != indexes.length){
            throw new Error("Duplicate step indexes aren't allowed!")
        }
        // check if last step has a redundant restore()
            if (steps[steps.length-1].restore){
            throw new Error("Last step shouldn't have a restore function!")
        }
        return steps
    }

    createScenario(...steps) {
        let scenario = this.validSteps(...steps)  
        // Step order according to their index
        return scenario.sort((a, b) => a.index - b.index)
    }

    async dispatch(scenario) {
        scenario = this.createScenario(...scenario)
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

    async rollback(scenario){
        for (let i = scenario.length - 1; i >= 0; --i){
            let step = scenario[i]
            if(step.restore){

                await step.restore(this.store)
            }
        }
        this.store = null
    }   

    updateLogs(STEP, error, storeBefore, storeAfter) {
        let errored = !(storeBefore && storeAfter)
        let step = {...STEP}
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