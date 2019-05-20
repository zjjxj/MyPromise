// 定义promise的三种状态值2
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';

const isFunction = variable => typeof variable === 'function'

/**
 * new promise((resolve, reject)=>{
 *          resolve(value);
 * })
 */
class MyPromise{
    constructor(handle) {
        if(!isFunction(handle)){
            throw new Error('MyPromise must accept a function as a parameter');
        }

        this._status = PENDING;
        this._value = undefined;
        this._fulfilledQueues = [];
        this._rejectedQueues = [];

        try {
            handle(this._resolve.bind(this), this._reject.bind(this));
        } catch (err) {
            this._reject(err);
        }
    }

    _resolve(value) {
        if(this._status !== PENDING) return;
        this._status = FULFILLED;
        this._value = value;
    }

    _reject(err) {
        if(this._status !== PENDING) return;
        this._status = REJECTED;
        this._value = err;
    }

    then(onFulfilled, onRejected) {
        const {_status, _value} = this;

        return new MyPromise((onFulfilledNext, onRejectedNext)=>{
            let fulfilled = (value) => {
                try{
                    // 如果参数不是函数 则忽略
                    if (isFunction(onFulfilled)) {
                        onFulfilledNext(value);
                    } else {
                        let res = onFulfilled(value);
                        if(res instanceof MyPromise) {
                            res.then(onFulfilledNext, onRejectedNext);
                        } else {
                            onFulfilledNext(res);
                        }
                    }
                }catch(err){
                    onRejectedNext(err)
                }
            }

            let rejected = (err) => {
                try{
                    // 如果参数不是函数 则忽略
                    if (isFunction(onRejected)) {
                        onRejectedNext(err)
                    } else {
                        let res = onRejected(value);
                        if(res instanceof MyPromise) {
                            res.then(onFulfilledNext, onRejectedNext);
                        } else {
                            onFulfilledNext(res);
                        }
                    }
                }catch(err){
                    onRejectedNext(err)
                }
            }
            switch (_status){
                case PENDING:
                    this._fulfilledQueues.push(fulfilled);
                    this._rejectedQueues.push(rejected);
                    break;
                case FULFILLED:
                    fulfilled(_value);
                    break;
                case REJECTED:
                    rejected(_value);
                    break;    
            }

        });
    }

}