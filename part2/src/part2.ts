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
    let promiseStore: Map<K, Promise<V>> = new Map()
    return {
        get(key: K) {
            const promise: Promise<V> | undefined = promiseStore.get(key)
            return promise === undefined ? new Promise<V>((resolve, reject) => reject(MISSING_KEY)) : promise
        },
        set(key: K, value: V) {
            promiseStore.set(key, new Promise<V>((resolve, reject) => resolve(value)))
            return new Promise<void>((resolve, reject) => resolve())
        },
        delete(key: K) {
            return promiseStore.delete(key) ? new Promise<void>((resolve, reject) => {resolve()}) : new Promise<void>((resolve, reject) => reject(MISSING_KEY))
        },
    }
}

// export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): ??? {
//     ???
// }

/* 2.2 */

// ??? (you may want to add helper functions here)
//
// export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
//     ???
// }

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