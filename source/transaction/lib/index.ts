export interface Store extends Object{
    [property:string]: any
};

export interface Step {
    index: number,
    meta: { 
        title: string,
        description: string
    },
    call: (store:Store) => any,
    restore?: (store: Store) => any,
    silent?: boolean
}

export interface Log extends Step {
    // ...step: Step,
    error: Error,
    storeBefore?: Store,
    storeAfter?: Store
}