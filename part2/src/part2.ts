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
    let currPromise:Promise<any> = fns[0]()
    const rest: { (elem: any): Promise<any> }[] = fns.slice(1)
    for (let i = 0; i < rest.length; i++) {
        const curr:any = await currPromise
        console.log(curr)
        currPromise = rest[i](curr).catch((err)=>{
            console.log("first fail")
            setTimeout(()=>null,2000)
            return rest[i](curr).catch((err)=>{
                console.log("second fail")
                setTimeout(()=>null,2000)
                return rest[i](curr).catch((err)=>{
                    console.log("failed 3 times, exiting...")
                    console.log(err)
                    throw err
                })
            })
        })
    }
    return await currPromise
}

// export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...func[]]): Promise<any> {
//     let first: Promise<any> = fns[0]()
//     const rest:func[] = fns.slice(1)
//
//     function* applyAllFunctions():Generator<number>{
//         for (let i = 0; i < rest.length; i++) {
//             yield i
//         }
//     }
//
//     let gen = applyAllFunctions()
//     let curr = gen.next()
//     const timeOutPromise: Promise<any> = new Promise(resolve => setTimeout(resolve, 2000))
//     const tryFirst = ():any =>{
//         first.then(res => {
//             console.log(res)
//             return res
//         })
//             .catch(() => {
//                 timeOutPromise.then()
//                 first.then(res => {
//                     return res
//                 })
//                     .catch(() => {
//                         timeOutPromise.then()
//                         first.then((res) => {
//                             return res
//                         })
//                             .catch(() => {
//                                 return false
//                             })
//                     })
//             })
//     }
//
//
//
//     let currentRes = await first
//     console.log(currentRes)
//     if (!currentRes) {
//         console.log("here")
//         // return
//     }
//     curr = gen.next()
//     while (!curr.done){
//         rest[curr.value].apply(currentRes).then(res => {
//             curr = gen.next()
//             currentRes = res
//         })
//             .catch(() => {
//                 timeOutPromise.then()
//                 rest[curr.value].apply(currentRes).then(res => {
//                     curr = gen.next()
//                     currentRes = res
//                 }).catch(() => {
//                     timeOutPromise.then()
//                     rest[curr.value].apply(currentRes).then(res => {
//                         curr = gen.next()
//                         currentRes = res
//                     })
//                         .catch((err) => {
//                             throw err
//                         })
//                 })
//             })
//     }
// }









