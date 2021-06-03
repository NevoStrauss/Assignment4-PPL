/* 2.1 */


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
    return Promise.all(keys.map(k=> store.get(k)))
}

/* 2.2 */

export function asyncMemo <T, R> (f: (param: T) => R): (param: T) => Promise<R> {
    const store:PromisedStore<T, R> = makePromisedStore()
    return async (param:T):Promise<R>=>{
        try {
            await store.get(param)
        }catch (e){
            await store.set(param, f(param))
        }
        return store.get(param)
    }
}



/* 2.3 */

function* f<T>(gen: Generator<T>, filterFn: (elem:T) => boolean):Generator<T> {
    let current = gen.next()
    while(!current.done) {
        if(filterFn(current.value))
            yield current.value
        current = gen.next()
    }
}


export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (elem: T)=>boolean): ()=> Generator<T> {
    return ():Generator<T> => f(genFn(),filterFn)
}

function* m<T,R>(gen:Generator<T>, mapFn:(elem:T) => R): Generator<R>{
    let current = gen.next()
    while (!current.done){
        yield mapFn(current.value)
        current = gen.next()
    }
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (elem: T) => R): () => Generator<R> {
 return ():Generator<R> => m(genFn(),mapFn)
}

/* 2.4 */
// you can use 'any' in this question


export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...{ (elem: any):Promise<any> }[]]): Promise<any> {
    let currPromise:Promise<any> = fns[0]().catch(() => {
        return new Promise<any>(((resolve, reject) =>
            setTimeout(() => {
                resolve(fns[0]().catch(() => {
                    return new Promise<any>(((resolve1, reject1) => {
                        setTimeout(() => {
                            resolve1(fns[0]().catch((err) => {
                                reject1(err)
                            }))
                        }, 2000)
                    }))
                }))
            }, 2000)))
    })
    const rest: { (elem: any): Promise<any> }[] = fns.slice(1)
    for (let i = 0; i < rest.length; i++) {
        const curr: any = await currPromise
        currPromise = rest[i](curr).catch(() => {
            return new Promise<any>(((resolve) =>
                setTimeout(() => {
                    resolve(rest[i](curr).catch(() => {
                        return new Promise<any>(((resolve1, reject1) => {
                            setTimeout(() => {
                                resolve1(rest[i](curr).catch((err) => {
                                    reject1(err)
                                }))
                            }, 2000)
                        }))
                    }))
                }, 2000)))
        })
    }
    return await currPromise
}