export class Validator {
    static validate(step, schema) {
        let props = Object.keys(schema);
        return props.every(prop => {
            let isValid = true;
            if (typeof step[prop] === 'object') {
                isValid = Validator.validate(step[prop], schema[prop])
            } else if (!step[prop]) {
                if (!(schema[prop].optional)) {
                    isValid = false;
                    throw new Error(`Data missing required ${prop} property`)
                }
            } else if (step[prop]) {
                if (!(typeof step[prop] === schema[prop].type)) {
                    isValid = false;
                    throw new Error(`${prop} property should be type of ${schema[prop].type}`)
                }
            }
            return isValid;
        })
    }
}
