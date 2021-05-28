/* 2.1 */

import undefinedError = Mocha.utils.undefinedError;
import {AppExp, isAppExp} from "../../part3/src/L51-ast";

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    let promiseStore: Map<K, V> = new Map()
    return {
        get(key: K) {
            const val: V | undefined = promiseStore.get(key)
            return new Promise<V>(((resolve, reject) => val !== undefined ? resolve(val) : reject(MISSING_KEY)))
        },
        set(key: K, value: V) {
            return new Promise<void>((resolve) => {
                promiseStore.set(key, value)
                resolve()
            })
        },
        delete(key: K) {
            return new Promise<void>(((resolve, reject) => promiseStore.delete(key) ? resolve() : reject(MISSING_KEY)))
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    return new Promise<V[]>((resolve) =>{
        const promises: Promise<V>[] = keys.map(k=> store.get(k))
        resolve(Promise.all(promises))
    })
}

/* 2.2 */

// ??? (you may want to add helper functions here)

export function asyncMemo  <T, R> (f: (param: T) => R): (param: T) => Promise<R> {
    const store:PromisedStore<T, R> = makePromisedStore()

    return async (param:T):Promise<R>=>{
        console.log(param)
        console.log(f(param))
        await store.set(param,f(param))
        return store.get(param)
    }
}


/* 2.3 */

// export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: ???): ??? {
//     ???
// }

// export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: ???): ??? {
//     ???
// }

/* 2.4 */
// you can use 'any' in this question

// export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...(???)[]]): Promise<any> {
//     ???
// }