export interface Store {
    [property: string]: number;
}

export interface Step {
    index: number;
    meta: {
        title: string;
        description: string;
    };
    restore?: (store: Store | null) => void;
    silent?: boolean;
    call(store: Store | null): void;
}

export interface Log extends Step {
    // ...step: Step,
    error: Error | null;
    storeBefore?: Store | null;
    storeAfter?: Store | null;
}
