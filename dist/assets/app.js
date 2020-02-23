(function () {
    'use strict';

    // Make a map and return a function for checking if a key
    // is in that map.
    //
    // IMPORTANT: all calls of this function must be prefixed with /*#__PURE__*/
    // So that rollup can tree-shake them if necessary.
    function makeMap(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(',');
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
    }

    const EMPTY_OBJ =  {};
    const NOOP = () => { };
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasOwn = (val, key) => hasOwnProperty.call(val, key);
    const isArray = Array.isArray;
    const isFunction = (val) => typeof val === 'function';
    const isSymbol = (val) => typeof val === 'symbol';
    const isObject = (val) => val !== null && typeof val === 'object';
    const objectToString = Object.prototype.toString;
    const toTypeString = (value) => objectToString.call(value);
    const toRawType = (value) => {
        return toTypeString(value).slice(8, -1);
    };
    // compare whether a value has changed, accounting for NaN.
    const hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

    const targetMap = new WeakMap();
    const effectStack = [];
    let activeEffect;
    const ITERATE_KEY = Symbol('iterate');
    function isEffect(fn) {
        return fn != null && fn._isEffect === true;
    }
    function effect(fn, options = EMPTY_OBJ) {
        if (isEffect(fn)) {
            fn = fn.raw;
        }
        const effect = createReactiveEffect(fn, options);
        if (!options.lazy) {
            effect();
        }
        return effect;
    }
    function stop(effect) {
        if (effect.active) {
            cleanup(effect);
            if (effect.options.onStop) {
                effect.options.onStop();
            }
            effect.active = false;
        }
    }
    function createReactiveEffect(fn, options) {
        const effect = function reactiveEffect(...args) {
            return run(effect, fn, args);
        };
        effect._isEffect = true;
        effect.active = true;
        effect.raw = fn;
        effect.deps = [];
        effect.options = options;
        return effect;
    }
    function run(effect, fn, args) {
        if (!effect.active) {
            return fn(...args);
        }
        if (!effectStack.includes(effect)) {
            cleanup(effect);
            try {
                enableTracking();
                effectStack.push(effect);
                activeEffect = effect;
                return fn(...args);
            }
            finally {
                effectStack.pop();
                resetTracking();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    }
    function cleanup(effect) {
        const { deps } = effect;
        if (deps.length) {
            for (let i = 0; i < deps.length; i++) {
                deps[i].delete(effect);
            }
            deps.length = 0;
        }
    }
    let shouldTrack = true;
    const trackStack = [];
    function pauseTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = false;
    }
    function enableTracking() {
        trackStack.push(shouldTrack);
        shouldTrack = true;
    }
    function resetTracking() {
        const last = trackStack.pop();
        shouldTrack = last === undefined ? true : last;
    }
    function track(target, type, key) {
        if (!shouldTrack || activeEffect === undefined) {
            return;
        }
        let depsMap = targetMap.get(target);
        if (depsMap === void 0) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (dep === void 0) {
            depsMap.set(key, (dep = new Set()));
        }
        if (!dep.has(activeEffect)) {
            dep.add(activeEffect);
            activeEffect.deps.push(dep);
        }
    }
    function trigger(target, type, key, extraInfo) {
        const depsMap = targetMap.get(target);
        if (depsMap === void 0) {
            // never been tracked
            return;
        }
        const effects = new Set();
        const computedRunners = new Set();
        if (type === "clear" /* CLEAR */) {
            // collection being cleared, trigger all effects for target
            depsMap.forEach(dep => {
                addRunners(effects, computedRunners, dep);
            });
        }
        else {
            // schedule runs for SET | ADD | DELETE
            if (key !== void 0) {
                addRunners(effects, computedRunners, depsMap.get(key));
            }
            // also run for iteration key on ADD | DELETE | Map.SET
            if (type === "add" /* ADD */ ||
                type === "delete" /* DELETE */ ||
                (type === "set" /* SET */ && target instanceof Map)) {
                const iterationKey = isArray(target) ? 'length' : ITERATE_KEY;
                addRunners(effects, computedRunners, depsMap.get(iterationKey));
            }
        }
        const run = (effect) => {
            scheduleRun(effect);
        };
        // Important: computed effects must be run first so that computed getters
        // can be invalidated before any normal effects that depend on them are run.
        computedRunners.forEach(run);
        effects.forEach(run);
    }
    function addRunners(effects, computedRunners, effectsToAdd) {
        if (effectsToAdd !== void 0) {
            effectsToAdd.forEach(effect => {
                if (effect !== activeEffect) {
                    if (effect.options.computed) {
                        computedRunners.add(effect);
                    }
                    else {
                        effects.add(effect);
                    }
                }
            });
        }
    }
    function scheduleRun(effect, target, type, key, extraInfo) {
        if (effect.options.scheduler !== void 0) {
            effect.options.scheduler(effect);
        }
        else {
            effect();
        }
    }

    // global immutability lock
    let LOCKED = true;
    function lock() {
        LOCKED = true;
    }
    function unlock() {
        LOCKED = false;
    }

    const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
        .map(key => Symbol[key])
        .filter(isSymbol));
    const get = /*#__PURE__*/ createGetter();
    const readonlyGet = /*#__PURE__*/ createGetter(true);
    const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
    const arrayIdentityInstrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
        arrayIdentityInstrumentations[key] = function (value, ...args) {
            return toRaw(this)[key](toRaw(value), ...args);
        };
    });
    function createGetter(isReadonly = false, shallow = false) {
        return function get(target, key, receiver) {
            if (isArray(target) && hasOwn(arrayIdentityInstrumentations, key)) {
                return Reflect.get(arrayIdentityInstrumentations, key, receiver);
            }
            const res = Reflect.get(target, key, receiver);
            if (isSymbol(key) && builtInSymbols.has(key)) {
                return res;
            }
            if (shallow) {
                track(target, "get" /* GET */, key);
                // TODO strict mode that returns a shallow-readonly version of the value
                return res;
            }
            if (isRef(res)) {
                return res.value;
            }
            track(target, "get" /* GET */, key);
            return isObject(res)
                ? isReadonly
                    ? // need to lazy access readonly and reactive here to avoid
                        // circular dependency
                        readonly(res)
                    : reactive(res)
                : res;
        };
    }
    const set = /*#__PURE__*/ createSetter();
    const readonlySet = /*#__PURE__*/ createSetter(true);
    const shallowReadonlySet = /*#__PURE__*/ createSetter(true, true);
    function createSetter(isReadonly = false, shallow = false) {
        return function set(target, key, value, receiver) {
            if (isReadonly && LOCKED) {
                return true;
            }
            const oldValue = target[key];
            if (!shallow) {
                value = toRaw(value);
                if (isRef(oldValue) && !isRef(value)) {
                    oldValue.value = value;
                    return true;
                }
            }
            const hadKey = hasOwn(target, key);
            const result = Reflect.set(target, key, value, receiver);
            // don't trigger if target is something up in the prototype chain of original
            if (target === toRaw(receiver)) {
                /* istanbul ignore else */
                {
                    if (!hadKey) {
                        trigger(target, "add" /* ADD */, key);
                    }
                    else if (hasChanged(value, oldValue)) {
                        trigger(target, "set" /* SET */, key);
                    }
                }
            }
            return result;
        };
    }
    function deleteProperty(target, key) {
        const hadKey = hasOwn(target, key);
        const oldValue = target[key];
        const result = Reflect.deleteProperty(target, key);
        if (result && hadKey) {
            /* istanbul ignore else */
            {
                trigger(target, "delete" /* DELETE */, key);
            }
        }
        return result;
    }
    function has(target, key) {
        const result = Reflect.has(target, key);
        track(target, "has" /* HAS */, key);
        return result;
    }
    function ownKeys(target) {
        track(target, "iterate" /* ITERATE */, ITERATE_KEY);
        return Reflect.ownKeys(target);
    }
    const mutableHandlers = {
        get,
        set,
        deleteProperty,
        has,
        ownKeys
    };
    const readonlyHandlers = {
        get: readonlyGet,
        set: readonlySet,
        has,
        ownKeys,
        deleteProperty(target, key) {
            if (LOCKED) {
                return true;
            }
            else {
                return deleteProperty(target, key);
            }
        }
    };
    // Props handlers are special in the sense that it should not unwrap top-level
    // refs (in order to allow refs to be explicitly passed down), but should
    // retain the reactivity of the normal readonly object.
    const shallowReadonlyHandlers = {
        ...readonlyHandlers,
        get: shallowReadonlyGet,
        set: shallowReadonlySet
    };

    const toReactive = (value) => isObject(value) ? reactive(value) : value;
    const toReadonly = (value) => isObject(value) ? readonly(value) : value;
    const getProto = (v) => Reflect.getPrototypeOf(v);
    function get$1(target, key, wrap) {
        target = toRaw(target);
        key = toRaw(key);
        track(target, "get" /* GET */, key);
        return wrap(getProto(target).get.call(target, key));
    }
    function has$1(key) {
        const target = toRaw(this);
        key = toRaw(key);
        track(target, "has" /* HAS */, key);
        return getProto(target).has.call(target, key);
    }
    function size(target) {
        target = toRaw(target);
        track(target, "iterate" /* ITERATE */, ITERATE_KEY);
        return Reflect.get(getProto(target), 'size', target);
    }
    function add(value) {
        value = toRaw(value);
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, value);
        const result = proto.add.call(target, value);
        if (!hadKey) {
            /* istanbul ignore else */
            {
                trigger(target, "add" /* ADD */, value);
            }
        }
        return result;
    }
    function set$1(key, value) {
        value = toRaw(value);
        key = toRaw(key);
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, key);
        const oldValue = proto.get.call(target, key);
        const result = proto.set.call(target, key, value);
        /* istanbul ignore else */
        {
            if (!hadKey) {
                trigger(target, "add" /* ADD */, key);
            }
            else if (hasChanged(value, oldValue)) {
                trigger(target, "set" /* SET */, key);
            }
        }
        return result;
    }
    function deleteEntry(key) {
        key = toRaw(key);
        const target = toRaw(this);
        const proto = getProto(target);
        const hadKey = proto.has.call(target, key);
        const oldValue = proto.get ? proto.get.call(target, key) : undefined;
        // forward the operation before queueing reactions
        const result = proto.delete.call(target, key);
        if (hadKey) {
            /* istanbul ignore else */
            {
                trigger(target, "delete" /* DELETE */, key);
            }
        }
        return result;
    }
    function clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        // forward the operation before queueing reactions
        const result = getProto(target).clear.call(target);
        if (hadItems) {
            /* istanbul ignore else */
            {
                trigger(target, "clear" /* CLEAR */);
            }
        }
        return result;
    }
    function createForEach(isReadonly) {
        return function forEach(callback, thisArg) {
            const observed = this;
            const target = toRaw(observed);
            const wrap = isReadonly ? toReadonly : toReactive;
            track(target, "iterate" /* ITERATE */, ITERATE_KEY);
            // important: create sure the callback is
            // 1. invoked with the reactive map as `this` and 3rd arg
            // 2. the value received should be a corresponding reactive/readonly.
            function wrappedCallback(value, key) {
                return callback.call(observed, wrap(value), wrap(key), observed);
            }
            return getProto(target).forEach.call(target, wrappedCallback, thisArg);
        };
    }
    function createIterableMethod(method, isReadonly) {
        return function (...args) {
            const target = toRaw(this);
            const isPair = method === 'entries' ||
                (method === Symbol.iterator && target instanceof Map);
            const innerIterator = getProto(target)[method].apply(target, args);
            const wrap = isReadonly ? toReadonly : toReactive;
            track(target, "iterate" /* ITERATE */, ITERATE_KEY);
            // return a wrapped iterator which returns observed versions of the
            // values emitted from the real iterator
            return {
                // iterator protocol
                next() {
                    const { value, done } = innerIterator.next();
                    return done
                        ? { value, done }
                        : {
                            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                            done
                        };
                },
                // iterable protocol
                [Symbol.iterator]() {
                    return this;
                }
            };
        };
    }
    function createReadonlyMethod(method, type) {
        return function (...args) {
            if (LOCKED) {
                return type === "delete" /* DELETE */ ? false : this;
            }
            else {
                return method.apply(this, args);
            }
        };
    }
    const mutableInstrumentations = {
        get(key) {
            return get$1(this, key, toReactive);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false)
    };
    const readonlyInstrumentations = {
        get(key) {
            return get$1(this, key, toReadonly);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add: createReadonlyMethod(add, "add" /* ADD */),
        set: createReadonlyMethod(set$1, "set" /* SET */),
        delete: createReadonlyMethod(deleteEntry, "delete" /* DELETE */),
        clear: createReadonlyMethod(clear, "clear" /* CLEAR */),
        forEach: createForEach(true)
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach(method => {
        mutableInstrumentations[method] = createIterableMethod(method, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true);
    });
    function createInstrumentationGetter(instrumentations) {
        return (target, key, receiver) => Reflect.get(hasOwn(instrumentations, key) && key in target
            ? instrumentations
            : target, key, receiver);
    }
    const mutableCollectionHandlers = {
        get: createInstrumentationGetter(mutableInstrumentations)
    };
    const readonlyCollectionHandlers = {
        get: createInstrumentationGetter(readonlyInstrumentations)
    };

    // WeakMaps that store {raw <-> observed} pairs.
    const rawToReactive = new WeakMap();
    const reactiveToRaw = new WeakMap();
    const rawToReadonly = new WeakMap();
    const readonlyToRaw = new WeakMap();
    // WeakSets for values that are marked readonly or non-reactive during
    // observable creation.
    const readonlyValues = new WeakSet();
    const nonReactiveValues = new WeakSet();
    const collectionTypes = new Set([Set, Map, WeakMap, WeakSet]);
    const isObservableType = /*#__PURE__*/ makeMap('Object,Array,Map,Set,WeakMap,WeakSet');
    const canObserve = (value) => {
        return (!value._isVue &&
            !value._isVNode &&
            isObservableType(toRawType(value)) &&
            !nonReactiveValues.has(value));
    };
    function reactive(target) {
        // if trying to observe a readonly proxy, return the readonly version.
        if (readonlyToRaw.has(target)) {
            return target;
        }
        // target is explicitly marked as readonly by user
        if (readonlyValues.has(target)) {
            return readonly(target);
        }
        return createReactiveObject(target, rawToReactive, reactiveToRaw, mutableHandlers, mutableCollectionHandlers);
    }
    function readonly(target) {
        // value is a mutable observable, retrieve its original and return
        // a readonly version.
        if (reactiveToRaw.has(target)) {
            target = reactiveToRaw.get(target);
        }
        return createReactiveObject(target, rawToReadonly, readonlyToRaw, readonlyHandlers, readonlyCollectionHandlers);
    }
    // Return a reactive-copy of the original object, where only the root level
    // properties are readonly, and does NOT unwrap refs nor recursively convert
    // returned properties.
    // This is used for creating the props proxy object for stateful components.
    function shallowReadonly(target) {
        return createReactiveObject(target, rawToReadonly, readonlyToRaw, shallowReadonlyHandlers, readonlyCollectionHandlers);
    }
    function createReactiveObject(target, toProxy, toRaw, baseHandlers, collectionHandlers) {
        if (!isObject(target)) {
            return target;
        }
        // target already has corresponding Proxy
        let observed = toProxy.get(target);
        if (observed !== void 0) {
            return observed;
        }
        // target is already a Proxy
        if (toRaw.has(target)) {
            return target;
        }
        // only a whitelist of value types can be observed.
        if (!canObserve(target)) {
            return target;
        }
        const handlers = collectionTypes.has(target.constructor)
            ? collectionHandlers
            : baseHandlers;
        observed = new Proxy(target, handlers);
        toProxy.set(target, observed);
        toRaw.set(observed, target);
        return observed;
    }
    function isReactive(value) {
        return reactiveToRaw.has(value) || readonlyToRaw.has(value);
    }
    function toRaw(observed) {
        return reactiveToRaw.get(observed) || readonlyToRaw.get(observed) || observed;
    }
    function isRef(r) {
        return r ? r._isRef === true : false;
    }

    function computed(getterOrOptions) {
        let getter;
        let setter;
        if (isFunction(getterOrOptions)) {
            getter = getterOrOptions;
            setter =  NOOP;
        }
        else {
            getter = getterOrOptions.get;
            setter = getterOrOptions.set;
        }
        let dirty = true;
        let value;
        let computed;
        const runner = effect(getter, {
            lazy: true,
            // mark effect as computed so that it gets priority during trigger
            computed: true,
            scheduler: () => {
                if (!dirty) {
                    dirty = true;
                    trigger(computed, "set" /* SET */, 'value');
                }
            }
        });
        computed = {
            _isRef: true,
            // expose effect so computed can be stopped
            effect: runner,
            get value() {
                if (dirty) {
                    value = runner();
                    dirty = false;
                }
                track(computed, "get" /* GET */, 'value');
                return value;
            },
            set value(newValue) {
                setter(newValue);
            }
        };
        return computed;
    }

    // Make a map and return a function for checking if a key
    // is in that map.
    //
    // IMPORTANT: all calls of this function must be prefixed with /*#__PURE__*/
    // So that rollup can tree-shake them if necessary.
    function makeMap$1(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(',');
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
    }

    function normalizeStyle(value) {
        if (isArray$1(value)) {
            const res = {};
            for (let i = 0; i < value.length; i++) {
                const normalized = normalizeStyle(value[i]);
                if (normalized) {
                    for (const key in normalized) {
                        res[key] = normalized[key];
                    }
                }
            }
            return res;
        }
        else if (isObject$1(value)) {
            return value;
        }
    }
    function normalizeClass(value) {
        let res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray$1(value)) {
            for (let i = 0; i < value.length; i++) {
                res += normalizeClass(value[i]) + ' ';
            }
        }
        else if (isObject$1(value)) {
            for (const name in value) {
                if (value[name]) {
                    res += name + ' ';
                }
            }
        }
        return res.trim();
    }

    const EMPTY_OBJ$1 =  {};
    const EMPTY_ARR = [];
    const NOOP$1 = () => { };
    /**
     * Always return false.
     */
    const NO = () => false;
    const extend = (a, b) => {
        for (const key in b) {
            a[key] = b[key];
        }
        return a;
    };
    const remove = (arr, el) => {
        const i = arr.indexOf(el);
        if (i > -1) {
            arr.splice(i, 1);
        }
    };
    const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
    const hasOwn$1 = (val, key) => hasOwnProperty$1.call(val, key);
    const isArray$1 = Array.isArray;
    const isFunction$1 = (val) => typeof val === 'function';
    const isString = (val) => typeof val === 'string';
    const isObject$1 = (val) => val !== null && typeof val === 'object';
    const isPromise = (val) => {
        return isObject$1(val) && isFunction$1(val.then) && isFunction$1(val.catch);
    };
    const isReservedProp = /*#__PURE__*/ makeMap$1('key,ref,' +
        'onVnodeBeforeMount,onVnodeMounted,' +
        'onVnodeBeforeUpdate,onVnodeUpdated,' +
        'onVnodeBeforeUnmount,onVnodeUnmounted');
    const cacheStringFunction = (fn) => {
        const cache = Object.create(null);
        return ((str) => {
            const hit = cache[str];
            return hit || (cache[str] = fn(str));
        });
    };
    const camelizeRE = /-(\w)/g;
    const camelize = cacheStringFunction((str) => {
        return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
    });
    const hyphenateRE = /\B([A-Z])/g;
    const hyphenate = cacheStringFunction((str) => {
        return str.replace(hyphenateRE, '-$1').toLowerCase();
    });
    const capitalize = cacheStringFunction((str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });
    // compare whether a value has changed, accounting for NaN.
    const hasChanged$1 = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);

    const stack = [];
    function warn(msg, ...args) {
        // avoid props formatting or warn handler tracking deps that might be mutated
        // during patch, leading to infinite recursion.
        pauseTracking();
        const instance = stack.length ? stack[stack.length - 1].component : null;
        const appWarnHandler = instance && instance.appContext.config.warnHandler;
        const trace = getComponentTrace();
        if (appWarnHandler) {
            callWithErrorHandling(appWarnHandler, instance, 10 /* APP_WARN_HANDLER */, [
                msg + args.join(''),
                instance && instance.proxy,
                trace
                    .map(({ vnode }) => `at <${formatComponentName(vnode)}>`)
                    .join('\n'),
                trace
            ]);
        }
        else {
            const warnArgs = [`[Vue warn]: ${msg}`, ...args];
            if (trace.length &&
                // avoid spamming console during tests
                !("production" === 'test')) {
                warnArgs.push(`\n`, ...formatTrace(trace));
            }
            console.warn(...warnArgs);
        }
        resetTracking();
    }
    function getComponentTrace() {
        let currentVNode = stack[stack.length - 1];
        if (!currentVNode) {
            return [];
        }
        // we can't just use the stack because it will be incomplete during updates
        // that did not start from the root. Re-construct the parent chain using
        // instance parent pointers.
        const normalizedStack = [];
        while (currentVNode) {
            const last = normalizedStack[0];
            if (last && last.vnode === currentVNode) {
                last.recurseCount++;
            }
            else {
                normalizedStack.push({
                    vnode: currentVNode,
                    recurseCount: 0
                });
            }
            const parentInstance = currentVNode.component
                .parent;
            currentVNode = parentInstance && parentInstance.vnode;
        }
        return normalizedStack;
    }
    function formatTrace(trace) {
        const logs = [];
        trace.forEach((entry, i) => {
            logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
        });
        return logs;
    }
    function formatTraceEntry({ vnode, recurseCount }) {
        const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
        const open = ` at <${formatComponentName(vnode)}`;
        const close = `>` + postfix;
        const rootLabel = vnode.component.parent == null ? `(Root)` : ``;
        return vnode.props
            ? [open, ...formatProps(vnode.props), close, rootLabel]
            : [open + close, rootLabel];
    }
    const classifyRE = /(?:^|[-_])(\w)/g;
    const classify = (str) => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');
    function formatComponentName(vnode, file) {
        const Component = vnode.type;
        let name = isFunction$1(Component)
            ? Component.displayName || Component.name
            : Component.name;
        if (!name && file) {
            const match = file.match(/([^/\\]+)\.vue$/);
            if (match) {
                name = match[1];
            }
        }
        return name ? classify(name) : 'Anonymous';
    }
    function formatProps(props) {
        const res = [];
        const keys = Object.keys(props);
        keys.slice(0, 3).forEach(key => {
            res.push(...formatProp(key, props[key]));
        });
        if (keys.length > 3) {
            res.push(` ...`);
        }
        return res;
    }
    function formatProp(key, value, raw) {
        if (isString(value)) {
            value = JSON.stringify(value);
            return raw ? value : [`${key}=${value}`];
        }
        else if (typeof value === 'number' ||
            typeof value === 'boolean' ||
            value == null) {
            return raw ? value : [`${key}=${value}`];
        }
        else if (isRef(value)) {
            value = formatProp(key, toRaw(value.value), true);
            return raw ? value : [`${key}=Ref<`, value, `>`];
        }
        else if (isFunction$1(value)) {
            return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
        }
        else {
            value = toRaw(value);
            return raw ? value : [`${key}=`, value];
        }
    }
    function callWithErrorHandling(fn, instance, type, args) {
        let res;
        try {
            res = args ? fn(...args) : fn();
        }
        catch (err) {
            handleError(err, instance, type);
        }
        return res;
    }
    function callWithAsyncErrorHandling(fn, instance, type, args) {
        if (isFunction$1(fn)) {
            const res = callWithErrorHandling(fn, instance, type, args);
            if (res != null && !res._isVue && isPromise(res)) {
                res.catch((err) => {
                    handleError(err, instance, type);
                });
            }
            return res;
        }
        const values = [];
        for (let i = 0; i < fn.length; i++) {
            values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
        }
        return values;
    }
    function handleError(err, instance, type) {
        const contextVNode = instance ? instance.vnode : null;
        if (instance) {
            let cur = instance.parent;
            // the exposed instance is the render proxy to keep it consistent with 2.x
            const exposedInstance = instance.proxy;
            // in production the hook receives only the error code
            const errorInfo =  type;
            while (cur) {
                const errorCapturedHooks = cur.ec;
                if (errorCapturedHooks !== null) {
                    for (let i = 0; i < errorCapturedHooks.length; i++) {
                        if (errorCapturedHooks[i](err, exposedInstance, errorInfo)) {
                            return;
                        }
                    }
                }
                cur = cur.parent;
            }
            // app-level handling
            const appErrorHandler = instance.appContext.config.errorHandler;
            if (appErrorHandler) {
                callWithErrorHandling(appErrorHandler, null, 9 /* APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
                return;
            }
        }
        logError(err);
    }
    function logError(err, type, contextVNode) {
        // default behavior is crash in prod & test, recover in dev.
        {
            throw err;
        }
    }

    const queue = [];
    const postFlushCbs = [];
    const p = Promise.resolve();
    let isFlushing = false;
    let isFlushPending = false;
    function nextTick(fn) {
        return fn ? p.then(fn) : p;
    }
    function queueJob(job) {
        if (!queue.includes(job)) {
            queue.push(job);
            queueFlush();
        }
    }
    function invalidateJob(job) {
        const i = queue.indexOf(job);
        if (i > -1) {
            queue[i] = null;
        }
    }
    function queuePostFlushCb(cb) {
        if (!isArray$1(cb)) {
            postFlushCbs.push(cb);
        }
        else {
            postFlushCbs.push(...cb);
        }
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushing && !isFlushPending) {
            isFlushPending = true;
            nextTick(flushJobs);
        }
    }
    const dedupe = (cbs) => [...new Set(cbs)];
    function flushPostFlushCbs(seen) {
        if (postFlushCbs.length) {
            const cbs = dedupe(postFlushCbs);
            postFlushCbs.length = 0;
            for (let i = 0; i < cbs.length; i++) {
                cbs[i]();
            }
        }
    }
    function flushJobs(seen) {
        isFlushPending = false;
        isFlushing = true;
        let job;
        while ((job = queue.shift()) !== undefined) {
            if (job === null) {
                continue;
            }
            callWithErrorHandling(job, null, 12 /* SCHEDULER */);
        }
        flushPostFlushCbs();
        isFlushing = false;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length || postFlushCbs.length) {
            flushJobs();
        }
    }

    // mark the current rendering instance for asset resolution (e.g.
    // resolveComponent, resolveDirective) during render
    let currentRenderingInstance = null;
    // dev only flag to track whether $attrs was used during render.
    // If $attrs was used during render then the warning for failed attrs
    // fallthrough can be suppressed.
    let accessedAttrs = false;
    function renderComponentRoot(instance) {
        const { type: Component, vnode, proxy, withProxy, props, slots, attrs, vnodeHooks, emit, renderCache } = instance;
        let result;
        currentRenderingInstance = instance;
        try {
            if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
                // withProxy is a proxy with a diffrent `has` trap only for
                // runtime-compiled render functions using `with` block.
                const proxyToUse = withProxy || proxy;
                result = normalizeVNode(instance.render.call(proxyToUse, proxyToUse, renderCache));
            }
            else {
                // functional
                const render = Component;
                result = normalizeVNode(render.length > 1
                    ? render(props, {
                        attrs,
                        slots,
                        emit
                    })
                    : render(props, null /* we know it doesn't need it */));
            }
            // attr merging
            if (Component.props != null &&
                Component.inheritAttrs !== false &&
                attrs !== EMPTY_OBJ$1 &&
                Object.keys(attrs).length) {
                if (result.shapeFlag & 1 /* ELEMENT */ ||
                    result.shapeFlag & 6 /* COMPONENT */) {
                    result = cloneVNode(result, attrs);
                }
                else if (("production" !== 'production') && !accessedAttrs && result.type !== Comment) {
                    warn(`Extraneous non-props attributes (${Object.keys(attrs).join(',')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes.`);
                }
            }
            // inherit vnode hooks
            if (vnodeHooks !== EMPTY_OBJ$1) {
                result = cloneVNode(result, vnodeHooks);
            }
            // inherit directives
            if (vnode.dirs != null) {
                if (("production" !== 'production') && !isElementRoot(result)) {
                    warn(`Runtime directive used on component with non-element root node. ` +
                        `The directives will not function as intended.`);
                }
                result.dirs = vnode.dirs;
            }
            // inherit transition data
            if (vnode.transition != null) {
                if (("production" !== 'production') && !isElementRoot(result)) {
                    warn(`Component inside <Transition> renders non-element root node ` +
                        `that cannot be animated.`);
                }
                result.transition = vnode.transition;
            }
        }
        catch (err) {
            handleError(err, instance, 1 /* RENDER_FUNCTION */);
            result = createVNode(Comment);
        }
        currentRenderingInstance = null;
        return result;
    }
    function isElementRoot(vnode) {
        return (vnode.shapeFlag & 6 /* COMPONENT */ ||
            vnode.shapeFlag & 1 /* ELEMENT */ ||
            vnode.type === Comment // potential v-if branch switch
        );
    }
    function shouldUpdateComponent(prevVNode, nextVNode, parentComponent, optimized) {
        const { props: prevProps, children: prevChildren } = prevVNode;
        const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
        // force child update on runtime directive usage on component vnode.
        if (nextVNode.dirs != null) {
            return true;
        }
        if (patchFlag > 0) {
            if (patchFlag & 1024 /* DYNAMIC_SLOTS */) {
                // slot content that references values that might have changed,
                // e.g. in a v-for
                return true;
            }
            if (patchFlag & 16 /* FULL_PROPS */) {
                // presence of this flag indicates props are always non-null
                return hasPropsChanged(prevProps, nextProps);
            }
            else {
                if (patchFlag & 2 /* CLASS */) {
                    return prevProps.class === nextProps.class;
                }
                if (patchFlag & 4 /* STYLE */) {
                    return hasPropsChanged(prevProps.style, nextProps.style);
                }
                if (patchFlag & 8 /* PROPS */) {
                    const dynamicProps = nextVNode.dynamicProps;
                    for (let i = 0; i < dynamicProps.length; i++) {
                        const key = dynamicProps[i];
                        if (nextProps[key] !== prevProps[key]) {
                            return true;
                        }
                    }
                }
            }
        }
        else if (!optimized) {
            // this path is only taken by manually written render functions
            // so presence of any children leads to a forced update
            if (prevChildren != null || nextChildren != null) {
                if (nextChildren == null || !nextChildren.$stable) {
                    return true;
                }
            }
            if (prevProps === nextProps) {
                return false;
            }
            if (prevProps === null) {
                return nextProps !== null;
            }
            if (nextProps === null) {
                return true;
            }
            return hasPropsChanged(prevProps, nextProps);
        }
        return false;
    }
    function hasPropsChanged(prevProps, nextProps) {
        const nextKeys = Object.keys(nextProps);
        if (nextKeys.length !== Object.keys(prevProps).length) {
            return true;
        }
        for (let i = 0; i < nextKeys.length; i++) {
            const key = nextKeys[i];
            if (nextProps[key] !== prevProps[key]) {
                return true;
            }
        }
        return false;
    }
    function updateHOCHostEl({ vnode, parent }, el // HostNode
    ) {
        while (parent && parent.subTree === vnode) {
            (vnode = parent.vnode).el = el;
            parent = parent.parent;
        }
    }

    const isSuspense = (type) => type.__isSuspense;
    function queueEffectWithSuspense(fn, suspense) {
        if (suspense !== null && !suspense.isResolved) {
            if (isArray$1(fn)) {
                suspense.effects.push(...fn);
            }
            else {
                suspense.effects.push(fn);
            }
        }
        else {
            queuePostFlushCb(fn);
        }
    }

    // SFC scoped style ID management.
    // These are only used in esm-bundler builds, but since exports cannot be
    // conditional, we can only drop inner implementations in non-bundler builds.
    let currentScopeId = null;

    const isPortal = (type) => type.__isPortal;

    const Fragment = Symbol( undefined);
    const Text = Symbol( undefined);
    const Comment = Symbol( undefined);
    const Static = Symbol( undefined);
    let currentBlock = null;
    // Whether we should be tracking dynamic child nodes inside a block.
    // Only tracks when this value is > 0
    // We are not using a simple boolean because this value may need to be
    // incremented/decremented by nested usage of v-once (see below)
    let shouldTrack$1 = 1;
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null) {
        // class & style normalization.
        if (props !== null) {
            // for reactive or proxy objects, we need to clone it to enable mutation.
            if (isReactive(props) || SetupProxySymbol in props) {
                props = extend({}, props);
            }
            let { class: klass, style } = props;
            if (klass != null && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
            if (isObject$1(style)) {
                // reactive state objects need to be cloned since they are likely to be
                // mutated
                if (isReactive(style) && !isArray$1(style)) {
                    style = extend({}, style);
                }
                props.style = normalizeStyle(style);
            }
        }
        // encode the vnode type information into a bitmap
        const shapeFlag = isString(type)
            ? 1 /* ELEMENT */
            :  isSuspense(type)
                ? 128 /* SUSPENSE */
                : isPortal(type)
                    ? 64 /* PORTAL */
                    : isObject$1(type)
                        ? 4 /* STATEFUL_COMPONENT */
                        : isFunction$1(type)
                            ? 2 /* FUNCTIONAL_COMPONENT */
                            : 0;
        const vnode = {
            _isVNode: true,
            type,
            props,
            key: (props !== null && props.key) || null,
            ref: (props !== null && props.ref) || null,
            scopeId: currentScopeId,
            children: null,
            component: null,
            suspense: null,
            dirs: null,
            transition: null,
            el: null,
            anchor: null,
            target: null,
            shapeFlag,
            patchFlag,
            dynamicProps,
            dynamicChildren: null,
            appContext: null
        };
        normalizeChildren(vnode, children);
        // presence of a patch flag indicates this node needs patching on updates.
        // component nodes also should always be patched, because even if the
        // component doesn't need to update, it needs to persist the instance on to
        // the next vnode so that it can be properly unmounted later.
        if (shouldTrack$1 > 0 &&
            currentBlock !== null &&
            // the EVENTS flag is only for hydration and if it is the only flag, the
            // vnode should not be considered dynamic due to handler caching.
            patchFlag !== 32 /* HYDRATE_EVENTS */ &&
            (patchFlag > 0 ||
                shapeFlag & 128 /* SUSPENSE */ ||
                shapeFlag & 4 /* STATEFUL_COMPONENT */ ||
                shapeFlag & 2 /* FUNCTIONAL_COMPONENT */)) {
            currentBlock.push(vnode);
        }
        return vnode;
    }
    function cloneVNode(vnode, extraProps) {
        // This is intentionally NOT using spread or extend to avoid the runtime
        // key enumeration cost.
        return {
            _isVNode: true,
            type: vnode.type,
            props: extraProps
                ? vnode.props
                    ? mergeProps(vnode.props, extraProps)
                    : extraProps
                : vnode.props,
            key: vnode.key,
            ref: vnode.ref,
            scopeId: vnode.scopeId,
            children: vnode.children,
            target: vnode.target,
            shapeFlag: vnode.shapeFlag,
            patchFlag: vnode.patchFlag,
            dynamicProps: vnode.dynamicProps,
            dynamicChildren: vnode.dynamicChildren,
            appContext: vnode.appContext,
            dirs: vnode.dirs,
            transition: vnode.transition,
            // These should technically only be non-null on mounted VNodes. However,
            // they *should* be copied for kept-alive vnodes. So we just always copy
            // them since them being non-null during a mount doesn't affect the logic as
            // they will simply be overwritten.
            component: vnode.component,
            suspense: vnode.suspense,
            el: vnode.el,
            anchor: vnode.anchor
        };
    }
    function normalizeVNode(child) {
        if (child == null || typeof child === 'boolean') {
            // empty placeholder
            return createVNode(Comment);
        }
        else if (isArray$1(child)) {
            // fragment
            return createVNode(Fragment, null, child);
        }
        else if (typeof child === 'object') {
            // already vnode, this should be the most common since compiled templates
            // always produce all-vnode children arrays
            return child.el === null ? child : cloneVNode(child);
        }
        else {
            // strings and numbers
            return createVNode(Text, null, String(child));
        }
    }
    // optimized normalization for template-compiled render fns
    function cloneIfMounted(child) {
        return child.el === null ? child : cloneVNode(child);
    }
    function normalizeChildren(vnode, children) {
        let type = 0;
        if (children == null) {
            children = null;
        }
        else if (isArray$1(children)) {
            type = 16 /* ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') {
            type = 32 /* SLOTS_CHILDREN */;
        }
        else if (isFunction$1(children)) {
            children = { default: children };
            type = 32 /* SLOTS_CHILDREN */;
        }
        else {
            children = String(children);
            type = 8 /* TEXT_CHILDREN */;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    const handlersRE = /^on|^vnode/;
    function mergeProps(...args) {
        const ret = {};
        extend(ret, args[0]);
        for (let i = 1; i < args.length; i++) {
            const toMerge = args[i];
            for (const key in toMerge) {
                if (key === 'class') {
                    ret.class = normalizeClass([ret.class, toMerge.class]);
                }
                else if (key === 'style') {
                    ret.style = normalizeStyle([ret.style, toMerge.style]);
                }
                else if (handlersRE.test(key)) {
                    // on*, vnode*
                    const existing = ret[key];
                    ret[key] = existing
                        ? [].concat(existing, toMerge[key])
                        : toMerge[key];
                }
                else {
                    ret[key] = toMerge[key];
                }
            }
        }
        return ret;
    }

    // resolve raw VNode data.
    // - filter out reserved keys (key, ref)
    // - extract class and style into $attrs (to be merged onto child
    //   component root)
    // - for the rest:
    //   - if has declared props: put declared ones in `props`, the rest in `attrs`
    //   - else: everything goes in `props`.
    function resolveProps(instance, rawProps, _options) {
        const hasDeclaredProps = _options != null;
        if (!rawProps && !hasDeclaredProps) {
            return;
        }
        const { 0: options, 1: needCastKeys } = normalizePropsOptions(_options);
        const props = {};
        let attrs = undefined;
        let vnodeHooks = undefined;
        // update the instance propsProxy (passed to setup()) to trigger potential
        // changes
        const propsProxy = instance.propsProxy;
        const setProp = propsProxy
            ? (key, val) => {
                props[key] = val;
                propsProxy[key] = val;
            }
            : (key, val) => {
                props[key] = val;
            };
        // allow mutation of propsProxy (which is readonly by default)
        unlock();
        if (rawProps != null) {
            for (const key in rawProps) {
                const value = rawProps[key];
                // key, ref are reserved and never passed down
                if (isReservedProp(key)) {
                    if (key !== 'key' && key !== 'ref') {
                        (vnodeHooks || (vnodeHooks = {}))[key] = value;
                    }
                    continue;
                }
                // prop option names are camelized during normalization, so to support
                // kebab -> camel conversion here we need to camelize the key.
                if (hasDeclaredProps) {
                    const camelKey = camelize(key);
                    if (hasOwn$1(options, camelKey)) {
                        setProp(camelKey, value);
                    }
                    else {
                        (attrs || (attrs = {}))[key] = value;
                    }
                }
                else {
                    setProp(key, value);
                }
            }
        }
        if (hasDeclaredProps) {
            // set default values & cast booleans
            for (let i = 0; i < needCastKeys.length; i++) {
                const key = needCastKeys[i];
                let opt = options[key];
                if (opt == null)
                    continue;
                const isAbsent = !hasOwn$1(props, key);
                const hasDefault = hasOwn$1(opt, 'default');
                const currentValue = props[key];
                // default values
                if (hasDefault && currentValue === undefined) {
                    const defaultValue = opt.default;
                    setProp(key, isFunction$1(defaultValue) ? defaultValue() : defaultValue);
                }
                // boolean casting
                if (opt[0 /* shouldCast */]) {
                    if (isAbsent && !hasDefault) {
                        setProp(key, false);
                    }
                    else if (opt[1 /* shouldCastTrue */] &&
                        (currentValue === '' || currentValue === hyphenate(key))) {
                        setProp(key, true);
                    }
                }
            }
        }
        else {
            // if component has no declared props, $attrs === $props
            attrs = props;
        }
        // in case of dynamic props, check if we need to delete keys from
        // the props proxy
        const { patchFlag } = instance.vnode;
        if (propsProxy !== null &&
            (patchFlag === 0 || patchFlag & 16 /* FULL_PROPS */)) {
            const rawInitialProps = toRaw(propsProxy);
            for (const key in rawInitialProps) {
                if (!hasOwn$1(props, key)) {
                    delete propsProxy[key];
                }
            }
        }
        // lock readonly
        lock();
        instance.props = props;
        instance.attrs = options ? attrs || EMPTY_OBJ$1 : props;
        instance.vnodeHooks = vnodeHooks || EMPTY_OBJ$1;
    }
    const normalizationMap = new WeakMap();
    function normalizePropsOptions(raw) {
        if (!raw) {
            return [];
        }
        if (normalizationMap.has(raw)) {
            return normalizationMap.get(raw);
        }
        const options = {};
        const needCastKeys = [];
        if (isArray$1(raw)) {
            for (let i = 0; i < raw.length; i++) {
                const normalizedKey = camelize(raw[i]);
                if (normalizedKey[0] !== '$') {
                    options[normalizedKey] = EMPTY_OBJ$1;
                }
            }
        }
        else {
            for (const key in raw) {
                const normalizedKey = camelize(key);
                if (normalizedKey[0] !== '$') {
                    const opt = raw[key];
                    const prop = (options[normalizedKey] =
                        isArray$1(opt) || isFunction$1(opt) ? { type: opt } : opt);
                    if (prop != null) {
                        const booleanIndex = getTypeIndex(Boolean, prop.type);
                        const stringIndex = getTypeIndex(String, prop.type);
                        prop[0 /* shouldCast */] = booleanIndex > -1;
                        prop[1 /* shouldCastTrue */] = booleanIndex < stringIndex;
                        // if the prop needs boolean casting or default value
                        if (booleanIndex > -1 || hasOwn$1(prop, 'default')) {
                            needCastKeys.push(normalizedKey);
                        }
                    }
                }
            }
        }
        const normalized = [options, needCastKeys];
        normalizationMap.set(raw, normalized);
        return normalized;
    }
    // use function string name to check type constructors
    // so that it works across vms / iframes.
    function getType(ctor) {
        const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
        return match ? match[1] : '';
    }
    function isSameType(a, b) {
        return getType(a) === getType(b);
    }
    function getTypeIndex(type, expectedTypes) {
        if (isArray$1(expectedTypes)) {
            for (let i = 0, len = expectedTypes.length; i < len; i++) {
                if (isSameType(expectedTypes[i], type)) {
                    return i;
                }
            }
        }
        else if (isObject$1(expectedTypes)) {
            return isSameType(expectedTypes, type) ? 0 : -1;
        }
        return -1;
    }

    const normalizeSlotValue = (value) => isArray$1(value)
        ? value.map(normalizeVNode)
        : [normalizeVNode(value)];
    const normalizeSlot = (key, rawSlot) => (props) => {
        return normalizeSlotValue(rawSlot(props));
    };
    function resolveSlots(instance, children) {
        let slots;
        if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
            const rawSlots = children;
            if (rawSlots._ === 1) {
                // pre-normalized slots object generated by compiler
                slots = children;
            }
            else {
                slots = {};
                for (const key in rawSlots) {
                    if (key === '$stable')
                        continue;
                    const value = rawSlots[key];
                    if (isFunction$1(value)) {
                        slots[key] = normalizeSlot(key, value);
                    }
                    else if (value != null) {
                        const normalized = normalizeSlotValue(value);
                        slots[key] = () => normalized;
                    }
                }
            }
        }
        else if (children !== null) {
            const normalized = normalizeSlotValue(children);
            slots = { default: () => normalized };
        }
        instance.slots = slots || EMPTY_OBJ$1;
    }
    function invokeDirectiveHook(hook, instance, vnode, prevVNode = null) {
        callWithAsyncErrorHandling(hook, instance, 7 /* DIRECTIVE_HOOK */, [
            vnode,
            prevVNode
        ]);
    }

    function createAppContext() {
        return {
            config: {
                devtools: true,
                performance: false,
                isNativeTag: NO,
                isCustomElement: NO,
                errorHandler: undefined,
                warnHandler: undefined
            },
            mixins: [],
            components: {},
            directives: {},
            provides: {}
        };
    }
    function createAppAPI(render, hydrate) {
        return function createApp(rootComponent, rootProps = null) {
            if (rootProps != null && !isObject$1(rootProps)) {
                rootProps = null;
            }
            const context = createAppContext();
            const installedPlugins = new Set();
            let isMounted = false;
            const app = {
                _component: rootComponent,
                _props: rootProps,
                _container: null,
                _context: context,
                get config() {
                    return context.config;
                },
                set config(v) {
                },
                use(plugin, ...options) {
                    if (installedPlugins.has(plugin)) ;
                    else if (plugin && isFunction$1(plugin.install)) {
                        installedPlugins.add(plugin);
                        plugin.install(app, ...options);
                    }
                    else if (isFunction$1(plugin)) {
                        installedPlugins.add(plugin);
                        plugin(app, ...options);
                    }
                    return app;
                },
                mixin(mixin) {
                    {
                        if (!context.mixins.includes(mixin)) {
                            context.mixins.push(mixin);
                        }
                    }
                    return app;
                },
                component(name, component) {
                    if (!component) {
                        return context.components[name];
                    }
                    context.components[name] = component;
                    return app;
                },
                directive(name, directive) {
                    if (!directive) {
                        return context.directives[name];
                    }
                    context.directives[name] = directive;
                    return app;
                },
                mount(rootContainer, isHydrate) {
                    if (!isMounted) {
                        const vnode = createVNode(rootComponent, rootProps);
                        // store app context on the root VNode.
                        // this will be set on the root instance on initial mount.
                        vnode.appContext = context;
                        if (isHydrate && hydrate) {
                            hydrate(vnode, rootContainer);
                        }
                        else {
                            render(vnode, rootContainer);
                        }
                        isMounted = true;
                        app._container = rootContainer;
                        return vnode.component.proxy;
                    }
                },
                unmount() {
                    if (isMounted) {
                        render(null, app._container);
                    }
                },
                provide(key, value) {
                    // TypeScript doesn't allow symbols as index type
                    // https://github.com/Microsoft/TypeScript/issues/24587
                    context.provides[key] = value;
                    return app;
                }
            };
            return app;
        };
    }
    const prodEffectOptions = {
        scheduler: queueJob
    };
    function invokeHooks(hooks, arg) {
        for (let i = 0; i < hooks.length; i++) {
            hooks[i](arg);
        }
    }
    const queuePostRenderEffect =  queueEffectWithSuspense
        ;
    /**
     * The createRenderer function accepts two generic arguments:
     * HostNode and HostElement, corresponding to Node and Element types in the
     * host environment. For example, for runtime-dom, HostNode would be the DOM
     * `Node` interface and HostElement would be the DOM `Element` interface.
     *
     * Custom renderers can pass in the platform specific types like this:
     *
     * ``` js
     * const { render, createApp } = createRenderer<Node, Element>({
     *   patchProp,
     *   ...nodeOps
     * })
     * ```
     */
    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    // implementation
    function baseCreateRenderer(options, createHydrationFns) {
        const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP$1, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
        // Note: functions inside this closure should use `const xxx = () => {}`
        // style in order to prevent being inlined by minifiers.
        const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, optimized = false) => {
            // patching & not same type, unmount old tree
            if (n1 != null && !isSameVNodeType(n1, n2)) {
                anchor = getNextHostNode(n1);
                unmount(n1, parentComponent, parentSuspense, true);
                n1 = null;
            }
            const { type, shapeFlag } = n2;
            switch (type) {
                case Text:
                    processText(n1, n2, container, anchor);
                    break;
                case Comment:
                    processCommentNode(n1, n2, container, anchor);
                    break;
                case Static:
                    if (n1 == null) {
                        mountStaticNode(n2, container, anchor, isSVG);
                    } // static nodes are noop on patch
                    break;
                case Fragment:
                    processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    break;
                default:
                    if (shapeFlag & 1 /* ELEMENT */) {
                        processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    }
                    else if (shapeFlag & 6 /* COMPONENT */) {
                        processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    }
                    else if (shapeFlag & 64 /* PORTAL */) {
                        type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals);
                    }
                    else if ( shapeFlag & 128 /* SUSPENSE */) {
                        type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, internals);
                    }
            }
        };
        const processText = (n1, n2, container, anchor) => {
            if (n1 == null) {
                hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
            }
            else {
                const el = (n2.el = n1.el);
                if (n2.children !== n1.children) {
                    hostSetText(el, n2.children);
                }
            }
        };
        const processCommentNode = (n1, n2, container, anchor) => {
            if (n1 == null) {
                hostInsert((n2.el = hostCreateComment(n2.children || '')), container, anchor);
            }
            else {
                // there's no support for dynamic comments
                n2.el = n1.el;
            }
        };
        const mountStaticNode = (n2, container, anchor, isSVG) => {
            if (n2.el != null && hostCloneNode !== undefined) {
                hostInsert(hostCloneNode(n2.el), container, anchor);
            }
            else {
                // static nodes are only present when used with compiler-dom/runtime-dom
                // which guarantees presence of hostInsertStaticContent.
                n2.el = hostInsertStaticContent(n2.children, container, anchor, isSVG);
            }
        };
        const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            isSVG = isSVG || n2.type === 'svg';
            if (n1 == null) {
                mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
            else {
                patchElement(n1, n2, parentComponent, parentSuspense, isSVG, optimized);
            }
            if (n2.ref !== null && parentComponent !== null) {
                setRef(n2.ref, n1 && n1.ref, parentComponent, n2.el);
            }
        };
        const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            let el;
            const { type, props, shapeFlag, transition, scopeId, patchFlag } = vnode;
            if (vnode.el !== null &&
                hostCloneNode !== undefined &&
                patchFlag === -1 /* HOISTED */) {
                // If a vnode has non-null el, it means it's being reused.
                // Only static vnodes can be reused, so its mounted DOM nodes should be
                // exactly the same, and we can simply do a clone here.
                el = vnode.el = hostCloneNode(vnode.el);
            }
            else {
                el = vnode.el = hostCreateElement(vnode.type, isSVG);
                // props
                if (props != null) {
                    for (const key in props) {
                        if (!isReservedProp(key)) {
                            hostPatchProp(el, key, props[key], null, isSVG);
                        }
                    }
                    if (props.onVnodeBeforeMount != null) {
                        invokeDirectiveHook(props.onVnodeBeforeMount, parentComponent, vnode);
                    }
                }
                // scopeId
                {
                    if (scopeId !== null) {
                        hostSetScopeId(el, scopeId);
                    }
                    const treeOwnerId = parentComponent && parentComponent.type.__scopeId;
                    // vnode's own scopeId and the current patched component's scopeId is
                    // different - this is a slot content node.
                    if (treeOwnerId != null && treeOwnerId !== scopeId) {
                        hostSetScopeId(el, treeOwnerId + '-s');
                    }
                }
                // children
                if (shapeFlag & 8 /* TEXT_CHILDREN */) {
                    hostSetElementText(el, vnode.children);
                }
                else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                    mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', optimized || vnode.dynamicChildren !== null);
                }
                if (transition != null && !transition.persisted) {
                    transition.beforeEnter(el);
                }
            }
            hostInsert(el, container, anchor);
            const vnodeMountedHook = props && props.onVnodeMounted;
            if (vnodeMountedHook != null ||
                (transition != null && !transition.persisted)) {
                queuePostRenderEffect(() => {
                    vnodeMountedHook &&
                        invokeDirectiveHook(vnodeMountedHook, parentComponent, vnode);
                    transition && !transition.persisted && transition.enter(el);
                }, parentSuspense);
            }
        };
        const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, optimized, start = 0) => {
            for (let i = start; i < children.length; i++) {
                const child = (children[i] = optimized
                    ? cloneIfMounted(children[i])
                    : normalizeVNode(children[i]));
                patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
        };
        const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, optimized) => {
            const el = (n2.el = n1.el);
            let { patchFlag, dynamicChildren } = n2;
            const oldProps = (n1 && n1.props) || EMPTY_OBJ$1;
            const newProps = n2.props || EMPTY_OBJ$1;
            if (newProps.onVnodeBeforeUpdate != null) {
                invokeDirectiveHook(newProps.onVnodeBeforeUpdate, parentComponent, n2, n1);
            }
            if (patchFlag > 0) {
                // the presence of a patchFlag means this element's render code was
                // generated by the compiler and can take the fast path.
                // in this path old node and new node are guaranteed to have the same shape
                // (i.e. at the exact same position in the source template)
                if (patchFlag & 16 /* FULL_PROPS */) {
                    // element props contain dynamic keys, full diff needed
                    patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
                }
                else {
                    // class
                    // this flag is matched when the element has dynamic class bindings.
                    if (patchFlag & 2 /* CLASS */) {
                        if (oldProps.class !== newProps.class) {
                            hostPatchProp(el, 'class', newProps.class, null, isSVG);
                        }
                    }
                    // style
                    // this flag is matched when the element has dynamic style bindings
                    if (patchFlag & 4 /* STYLE */) {
                        hostPatchProp(el, 'style', newProps.style, oldProps.style, isSVG);
                    }
                    // props
                    // This flag is matched when the element has dynamic prop/attr bindings
                    // other than class and style. The keys of dynamic prop/attrs are saved for
                    // faster iteration.
                    // Note dynamic keys like :[foo]="bar" will cause this optimization to
                    // bail out and go through a full diff because we need to unset the old key
                    if (patchFlag & 8 /* PROPS */) {
                        // if the flag is present then dynamicProps must be non-null
                        const propsToUpdate = n2.dynamicProps;
                        for (let i = 0; i < propsToUpdate.length; i++) {
                            const key = propsToUpdate[i];
                            const prev = oldProps[key];
                            const next = newProps[key];
                            if (prev !== next) {
                                hostPatchProp(el, key, next, prev, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
                            }
                        }
                    }
                }
                // text
                // This flag is matched when the element has only dynamic text children.
                if (patchFlag & 1 /* TEXT */) {
                    if (n1.children !== n2.children) {
                        hostSetElementText(el, n2.children);
                    }
                }
            }
            else if (!optimized && dynamicChildren == null) {
                // unoptimized, full diff
                patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
            }
            const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
            if (dynamicChildren != null) {
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG);
            }
            else if (!optimized) {
                // full diff
                patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG);
            }
            if (newProps.onVnodeUpdated != null) {
                queuePostRenderEffect(() => {
                    invokeDirectiveHook(newProps.onVnodeUpdated, parentComponent, n2, n1);
                }, parentSuspense);
            }
        };
        // The fast path for blocks.
        const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG) => {
            for (let i = 0; i < newChildren.length; i++) {
                const oldVNode = oldChildren[i];
                const newVNode = newChildren[i];
                // Determine the container (parent element) for the patch.
                const container = 
                // - In the case of a Fragment, we need to provide the actual parent
                // of the Fragment itself so it can move its children.
                oldVNode.type === Fragment ||
                    // - In the case of different nodes, there is going to be a replacement
                    // which also requires the correct parent container
                    !isSameVNodeType(oldVNode, newVNode) ||
                    // - In the case of a component, it could contain anything.
                    oldVNode.shapeFlag & 6 /* COMPONENT */
                    ? hostParentNode(oldVNode.el)
                    : // In other cases, the parent container is not actually used so we
                        // just pass the block element here to avoid a DOM parentNode call.
                        fallbackContainer;
                patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, true);
            }
        };
        const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
            if (oldProps !== newProps) {
                for (const key in newProps) {
                    if (isReservedProp(key))
                        continue;
                    const next = newProps[key];
                    const prev = oldProps[key];
                    if (next !== prev) {
                        hostPatchProp(el, key, next, prev, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
                if (oldProps !== EMPTY_OBJ$1) {
                    for (const key in oldProps) {
                        if (!isReservedProp(key) && !(key in newProps)) {
                            hostPatchProp(el, key, null, null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                }
            }
        };
        const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            const fragmentStartAnchor = (n2.el = n1
                ? n1.el
                : hostCreateComment( ''));
            const fragmentEndAnchor = (n2.anchor = n1
                ? n1.anchor
                : hostCreateComment( ''));
            let { patchFlag, dynamicChildren } = n2;
            if (patchFlag > 0) {
                optimized = true;
            }
            if (n1 == null) {
                hostInsert(fragmentStartAnchor, container, anchor);
                hostInsert(fragmentEndAnchor, container, anchor);
                // a fragment can only have array children
                // since they are either generated by the compiler, or implicitly created
                // from arrays.
                mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, optimized);
            }
            else {
                if (patchFlag & 64 /* STABLE_FRAGMENT */ && dynamicChildren != null) {
                    // a stable fragment (template root or <template v-for>) doesn't need to
                    // patch children order, but it may contain dynamicChildren.
                    patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG);
                }
                else {
                    // keyed / unkeyed, or manual fragments.
                    // for keyed & unkeyed, since they are compiler generated from v-for,
                    // each child is guaranteed to be a block so the fragment will never
                    // have dynamicChildren.
                    patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, optimized);
                }
            }
        };
        const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            if (n1 == null) {
                if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
                    parentComponent.sink.activate(n2, container, anchor);
                }
                else {
                    mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG);
                }
            }
            else {
                const instance = (n2.component = n1.component);
                if (shouldUpdateComponent(n1, n2, parentComponent, optimized)) {
                    if (
                        instance.asyncDep &&
                        !instance.asyncResolved) {
                        updateComponentPreRender(instance, n2);
                        return;
                    }
                    else {
                        // normal update
                        instance.next = n2;
                        // in case the child component is also queued, remove it to avoid
                        // double updating the same child component in the same flush.
                        invalidateJob(instance.update);
                        // instance.update is the reactive effect runner.
                        instance.update();
                    }
                }
                else {
                    // no update needed. just copy over properties
                    n2.component = n1.component;
                    n2.el = n1.el;
                }
            }
            if (n2.ref !== null && parentComponent !== null) {
                setRef(n2.ref, n1 && n1.ref, parentComponent, n2.component.proxy);
            }
        };
        const mountComponent = (initialVNode, container, // only null during hydration
        anchor, parentComponent, parentSuspense, isSVG) => {
            const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
            // inject renderer internals for keepAlive
            if (isKeepAlive(initialVNode)) {
                const sink = instance.sink;
                sink.renderer = internals;
                sink.parentSuspense = parentSuspense;
            }
            // resolve props and slots for setup context
            setupComponent(instance, parentSuspense);
            // setup() is async. This component relies on async logic to be resolved
            // before proceeding
            if ( instance.asyncDep) {
                if (!parentSuspense) {
                    return;
                }
                parentSuspense.registerDep(instance, setupRenderEffect);
                // Give it a placeholder if this is not hydration
                const placeholder = (instance.subTree = createVNode(Comment));
                processCommentNode(null, placeholder, container, anchor);
                initialVNode.el = placeholder.el;
                return;
            }
            setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG);
        };
        const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG) => {
            // create reactive effect for rendering
            instance.update = effect(function componentEffect() {
                if (!instance.isMounted) {
                    const subTree = (instance.subTree = renderComponentRoot(instance));
                    // beforeMount hook
                    if (instance.bm !== null) {
                        invokeHooks(instance.bm);
                    }
                    if (initialVNode.el && hydrateNode) {
                        // vnode has adopted host node - perform hydration instead of mount.
                        hydrateNode(initialVNode.el, subTree, instance);
                    }
                    else {
                        patch(null, subTree, container, // container is only null during hydration
                        anchor, instance, parentSuspense, isSVG);
                        initialVNode.el = subTree.el;
                    }
                    // mounted hook
                    if (instance.m !== null) {
                        queuePostRenderEffect(instance.m, parentSuspense);
                    }
                    // activated hook for keep-alive roots.
                    if (instance.a !== null &&
                        instance.vnode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
                        queuePostRenderEffect(instance.a, parentSuspense);
                    }
                    instance.isMounted = true;
                }
                else {
                    // updateComponent
                    // This is triggered by mutation of component's own state (next: null)
                    // OR parent calling processComponent (next: HostVNode)
                    const { next } = instance;
                    if (next !== null) {
                        updateComponentPreRender(instance, next);
                    }
                    const nextTree = renderComponentRoot(instance);
                    const prevTree = instance.subTree;
                    instance.subTree = nextTree;
                    // beforeUpdate hook
                    if (instance.bu !== null) {
                        invokeHooks(instance.bu);
                    }
                    // reset refs
                    // only needed if previous patch had refs
                    if (instance.refs !== EMPTY_OBJ$1) {
                        instance.refs = {};
                    }
                    patch(prevTree, nextTree, 
                    // parent may have changed if it's in a portal
                    hostParentNode(prevTree.el), 
                    // anchor may have changed if it's in a fragment
                    getNextHostNode(prevTree), instance, parentSuspense, isSVG);
                    instance.vnode.el = nextTree.el;
                    if (next === null) {
                        // self-triggered update. In case of HOC, update parent component
                        // vnode el. HOC is indicated by parent instance's subTree pointing
                        // to child component's vnode
                        updateHOCHostEl(instance, nextTree.el);
                    }
                    // updated hook
                    if (instance.u !== null) {
                        queuePostRenderEffect(instance.u, parentSuspense);
                    }
                }
            },  prodEffectOptions);
        };
        const updateComponentPreRender = (instance, nextVNode) => {
            nextVNode.component = instance;
            instance.vnode = nextVNode;
            instance.next = null;
            resolveProps(instance, nextVNode.props, nextVNode.type.props);
            resolveSlots(instance, nextVNode.children);
        };
        const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized = false) => {
            const c1 = n1 && n1.children;
            const prevShapeFlag = n1 ? n1.shapeFlag : 0;
            const c2 = n2.children;
            const { patchFlag, shapeFlag } = n2;
            if (patchFlag === -2 /* BAIL */) {
                optimized = false;
            }
            // fast path
            if (patchFlag > 0) {
                if (patchFlag & 128 /* KEYED_FRAGMENT */) {
                    // this could be either fully-keyed or mixed (some keyed some not)
                    // presence of patchFlag means children are guaranteed to be arrays
                    patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    return;
                }
                else if (patchFlag & 256 /* UNKEYED_FRAGMENT */) {
                    // unkeyed
                    patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    return;
                }
            }
            // children has 3 possibilities: text, array or no children.
            if (shapeFlag & 8 /* TEXT_CHILDREN */) {
                // text children fast path
                if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                    unmountChildren(c1, parentComponent, parentSuspense);
                }
                if (c2 !== c1) {
                    hostSetElementText(container, c2);
                }
            }
            else {
                if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                    // prev children was array
                    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                        // two arrays, cannot assume anything, do full diff
                        patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    }
                    else {
                        // no new children, just unmount old
                        unmountChildren(c1, parentComponent, parentSuspense, true);
                    }
                }
                else {
                    // prev children was text OR null
                    // new children is array OR null
                    if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
                        hostSetElementText(container, '');
                    }
                    // mount new if array
                    if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                        mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
                    }
                }
            }
        };
        const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
            c1 = c1 || EMPTY_ARR;
            c2 = c2 || EMPTY_ARR;
            const oldLength = c1.length;
            const newLength = c2.length;
            const commonLength = Math.min(oldLength, newLength);
            let i;
            for (i = 0; i < commonLength; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, optimized);
            }
            if (oldLength > newLength) {
                // remove old
                unmountChildren(c1, parentComponent, parentSuspense, true, commonLength);
            }
            else {
                // mount new
                mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, optimized, commonLength);
            }
        };
        // can be all-keyed or mixed
        const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized) => {
            let i = 0;
            const l2 = c2.length;
            let e1 = c1.length - 1; // prev ending index
            let e2 = l2 - 1; // next ending index
            // 1. sync from start
            // (a b) c
            // (a b) d e
            while (i <= e1 && i <= e2) {
                const n1 = c1[i];
                const n2 = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (isSameVNodeType(n1, n2)) {
                    patch(n1, n2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized);
                }
                else {
                    break;
                }
                i++;
            }
            // 2. sync from end
            // a (b c)
            // d e (b c)
            while (i <= e1 && i <= e2) {
                const n1 = c1[e1];
                const n2 = (c2[e2] = optimized
                    ? cloneIfMounted(c2[e2])
                    : normalizeVNode(c2[e2]));
                if (isSameVNodeType(n1, n2)) {
                    patch(n1, n2, container, parentAnchor, parentComponent, parentSuspense, isSVG, optimized);
                }
                else {
                    break;
                }
                e1--;
                e2--;
            }
            // 3. common sequence + mount
            // (a b)
            // (a b) c
            // i = 2, e1 = 1, e2 = 2
            // (a b)
            // c (a b)
            // i = 0, e1 = -1, e2 = 0
            if (i > e1) {
                if (i <= e2) {
                    const nextPos = e2 + 1;
                    const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                    while (i <= e2) {
                        patch(null, (c2[i] = optimized
                            ? cloneIfMounted(c2[i])
                            : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG);
                        i++;
                    }
                }
            }
            // 4. common sequence + unmount
            // (a b) c
            // (a b)
            // i = 2, e1 = 2, e2 = 1
            // a (b c)
            // (b c)
            // i = 0, e1 = 0, e2 = -1
            else if (i > e2) {
                while (i <= e1) {
                    unmount(c1[i], parentComponent, parentSuspense, true);
                    i++;
                }
            }
            // 5. unknown sequence
            // [i ... e1 + 1]: a b [c d e] f g
            // [i ... e2 + 1]: a b [e d c h] f g
            // i = 2, e1 = 4, e2 = 5
            else {
                const s1 = i; // prev starting index
                const s2 = i; // next starting index
                // 5.1 build key:index map for newChildren
                const keyToNewIndexMap = new Map();
                for (i = s2; i <= e2; i++) {
                    const nextChild = (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i]));
                    if (nextChild.key != null) {
                        keyToNewIndexMap.set(nextChild.key, i);
                    }
                }
                // 5.2 loop through old children left to be patched and try to patch
                // matching nodes & remove nodes that are no longer present
                let j;
                let patched = 0;
                const toBePatched = e2 - s2 + 1;
                let moved = false;
                // used to track whether any node has moved
                let maxNewIndexSoFar = 0;
                // works as Map<newIndex, oldIndex>
                // Note that oldIndex is offset by +1
                // and oldIndex = 0 is a special value indicating the new node has
                // no corresponding old node.
                // used for determining longest stable subsequence
                const newIndexToOldIndexMap = new Array(toBePatched);
                for (i = 0; i < toBePatched; i++)
                    newIndexToOldIndexMap[i] = 0;
                for (i = s1; i <= e1; i++) {
                    const prevChild = c1[i];
                    if (patched >= toBePatched) {
                        // all new children have been patched so this can only be a removal
                        unmount(prevChild, parentComponent, parentSuspense, true);
                        continue;
                    }
                    let newIndex;
                    if (prevChild.key != null) {
                        newIndex = keyToNewIndexMap.get(prevChild.key);
                    }
                    else {
                        // key-less node, try to locate a key-less node of the same type
                        for (j = s2; j <= e2; j++) {
                            if (newIndexToOldIndexMap[j - s2] === 0 &&
                                isSameVNodeType(prevChild, c2[j])) {
                                newIndex = j;
                                break;
                            }
                        }
                    }
                    if (newIndex === undefined) {
                        unmount(prevChild, parentComponent, parentSuspense, true);
                    }
                    else {
                        newIndexToOldIndexMap[newIndex - s2] = i + 1;
                        if (newIndex >= maxNewIndexSoFar) {
                            maxNewIndexSoFar = newIndex;
                        }
                        else {
                            moved = true;
                        }
                        patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, optimized);
                        patched++;
                    }
                }
                // 5.3 move and mount
                // generate longest stable subsequence only when nodes have moved
                const increasingNewIndexSequence = moved
                    ? getSequence(newIndexToOldIndexMap)
                    : EMPTY_ARR;
                j = increasingNewIndexSequence.length - 1;
                // looping backwards so that we can use last patched node as anchor
                for (i = toBePatched - 1; i >= 0; i--) {
                    const nextIndex = s2 + i;
                    const nextChild = c2[nextIndex];
                    const anchor = nextIndex + 1 < l2
                        ? c2[nextIndex + 1].el
                        : parentAnchor;
                    if (newIndexToOldIndexMap[i] === 0) {
                        // mount new
                        patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG);
                    }
                    else if (moved) {
                        // move if:
                        // There is no stable subsequence (e.g. a reverse)
                        // OR current node is not among the stable sequence
                        if (j < 0 || i !== increasingNewIndexSequence[j]) {
                            move(nextChild, container, anchor, 2 /* REORDER */);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
        };
        const move = (vnode, container, anchor, type, parentSuspense = null) => {
            if (vnode.shapeFlag & 6 /* COMPONENT */) {
                move(vnode.component.subTree, container, anchor, type);
                return;
            }
            if ( vnode.shapeFlag & 128 /* SUSPENSE */) {
                vnode.suspense.move(container, anchor, type);
                return;
            }
            if (vnode.type === Fragment) {
                hostInsert(vnode.el, container, anchor);
                const children = vnode.children;
                for (let i = 0; i < children.length; i++) {
                    move(children[i], container, anchor, type);
                }
                hostInsert(vnode.anchor, container, anchor);
            }
            else {
                // Plain element
                const { el, transition, shapeFlag } = vnode;
                const needTransition = type !== 2 /* REORDER */ &&
                    shapeFlag & 1 /* ELEMENT */ &&
                    transition != null;
                if (needTransition) {
                    if (type === 0 /* ENTER */) {
                        transition.beforeEnter(el);
                        hostInsert(el, container, anchor);
                        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
                    }
                    else {
                        const { leave, delayLeave, afterLeave } = transition;
                        const remove = () => hostInsert(el, container, anchor);
                        const performLeave = () => {
                            leave(el, () => {
                                remove();
                                afterLeave && afterLeave();
                            });
                        };
                        if (delayLeave) {
                            delayLeave(el, remove, performLeave);
                        }
                        else {
                            performLeave();
                        }
                    }
                }
                else {
                    hostInsert(el, container, anchor);
                }
            }
        };
        const unmount = (vnode, parentComponent, parentSuspense, doRemove = false) => {
            const { props, ref, children, dynamicChildren, shapeFlag } = vnode;
            // unset ref
            if (ref !== null && parentComponent !== null) {
                setRef(ref, null, parentComponent, null);
            }
            if (shapeFlag & 6 /* COMPONENT */) {
                if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
                    parentComponent.sink.deactivate(vnode);
                }
                else {
                    unmountComponent(vnode.component, parentSuspense, doRemove);
                }
                return;
            }
            if ( shapeFlag & 128 /* SUSPENSE */) {
                vnode.suspense.unmount(parentSuspense, doRemove);
                return;
            }
            if (props != null && props.onVnodeBeforeUnmount != null) {
                invokeDirectiveHook(props.onVnodeBeforeUnmount, parentComponent, vnode);
            }
            if (dynamicChildren != null) {
                // fast path for block nodes: only need to unmount dynamic children.
                unmountChildren(dynamicChildren, parentComponent, parentSuspense);
            }
            else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                unmountChildren(children, parentComponent, parentSuspense);
            }
            if (doRemove) {
                remove(vnode);
            }
            if (props != null && props.onVnodeUnmounted != null) {
                queuePostRenderEffect(() => {
                    invokeDirectiveHook(props.onVnodeUnmounted, parentComponent, vnode);
                }, parentSuspense);
            }
        };
        const remove = (vnode) => {
            const { type, el, anchor, transition } = vnode;
            if (type === Fragment) {
                removeFragment(el, anchor);
                return;
            }
            const performRemove = () => {
                hostRemove(el);
                if (transition != null &&
                    !transition.persisted &&
                    transition.afterLeave) {
                    transition.afterLeave();
                }
            };
            if (vnode.shapeFlag & 1 /* ELEMENT */ &&
                transition != null &&
                !transition.persisted) {
                const { leave, delayLeave } = transition;
                const performLeave = () => leave(el, performRemove);
                if (delayLeave) {
                    delayLeave(vnode.el, performRemove, performLeave);
                }
                else {
                    performLeave();
                }
            }
            else {
                performRemove();
            }
        };
        const removeFragment = (cur, end) => {
            // For fragments, directly remove all contained DOM nodes.
            // (fragment child nodes cannot have transition)
            let next;
            while (cur !== end) {
                next = hostNextSibling(cur);
                hostRemove(cur);
                cur = next;
            }
            hostRemove(end);
        };
        const unmountComponent = (instance, parentSuspense, doRemove) => {
            const { bum, effects, update, subTree, um, da, isDeactivated } = instance;
            // beforeUnmount hook
            if (bum !== null) {
                invokeHooks(bum);
            }
            if (effects !== null) {
                for (let i = 0; i < effects.length; i++) {
                    stop(effects[i]);
                }
            }
            // update may be null if a component is unmounted before its async
            // setup has resolved.
            if (update !== null) {
                stop(update);
                unmount(subTree, instance, parentSuspense, doRemove);
            }
            // unmounted hook
            if (um !== null) {
                queuePostRenderEffect(um, parentSuspense);
            }
            // deactivated hook
            if (da !== null &&
                !isDeactivated &&
                instance.vnode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
                queuePostRenderEffect(da, parentSuspense);
            }
            queuePostFlushCb(() => {
                instance.isUnmounted = true;
            });
            // A component with async dep inside a pending suspense is unmounted before
            // its async dep resolves. This should remove the dep from the suspense, and
            // cause the suspense to resolve immediately if that was the last dep.
            if (
                parentSuspense !== null &&
                !parentSuspense.isResolved &&
                !parentSuspense.isUnmounted &&
                instance.asyncDep !== null &&
                !instance.asyncResolved) {
                parentSuspense.deps--;
                if (parentSuspense.deps === 0) {
                    parentSuspense.resolve();
                }
            }
        };
        const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, start = 0) => {
            for (let i = start; i < children.length; i++) {
                unmount(children[i], parentComponent, parentSuspense, doRemove);
            }
        };
        const getNextHostNode = vnode => {
            if (vnode.shapeFlag & 6 /* COMPONENT */) {
                return getNextHostNode(vnode.component.subTree);
            }
            if ( vnode.shapeFlag & 128 /* SUSPENSE */) {
                return vnode.suspense.next();
            }
            return hostNextSibling((vnode.anchor || vnode.el));
        };
        const setRef = (ref, oldRef, parent, value) => {
            const refs = parent.refs === EMPTY_OBJ$1 ? (parent.refs = {}) : parent.refs;
            const renderContext = toRaw(parent.renderContext);
            // unset old ref
            if (oldRef !== null && oldRef !== ref) {
                if (isString(oldRef)) {
                    refs[oldRef] = null;
                    const oldSetupRef = renderContext[oldRef];
                    if (isRef(oldSetupRef)) {
                        oldSetupRef.value = null;
                    }
                }
                else if (isRef(oldRef)) {
                    oldRef.value = null;
                }
            }
            if (isString(ref)) {
                const setupRef = renderContext[ref];
                if (isRef(setupRef)) {
                    setupRef.value = value;
                }
                refs[ref] = value;
            }
            else if (isRef(ref)) {
                ref.value = value;
            }
            else if (isFunction$1(ref)) {
                callWithErrorHandling(ref, parent, 11 /* FUNCTION_REF */, [value, refs]);
            }
        };
        const render = (vnode, container) => {
            if (vnode == null) {
                if (container._vnode) {
                    unmount(container._vnode, null, null, true);
                }
            }
            else {
                patch(container._vnode || null, vnode, container);
            }
            flushPostFlushCbs();
            container._vnode = vnode;
        };
        const internals = {
            p: patch,
            um: unmount,
            m: move,
            mt: mountComponent,
            mc: mountChildren,
            pc: patchChildren,
            pbc: patchBlockChildren,
            n: getNextHostNode,
            c: processCommentNode,
            o: options
        };
        let hydrate;
        let hydrateNode;
        if (createHydrationFns) {
            [hydrate, hydrateNode] = createHydrationFns(internals);
        }
        return {
            render,
            hydrate,
            createApp: createAppAPI(render, hydrate)
        };
    }
    // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
    function getSequence(arr) {
        const p = arr.slice();
        const result = [0];
        let i, j, u, v, c;
        const len = arr.length;
        for (i = 0; i < len; i++) {
            const arrI = arr[i];
            if (arrI !== 0) {
                j = result[result.length - 1];
                if (arr[j] < arrI) {
                    p[i] = j;
                    result.push(i);
                    continue;
                }
                u = 0;
                v = result.length - 1;
                while (u < v) {
                    c = ((u + v) / 2) | 0;
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        v = c;
                    }
                }
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    result[u] = i;
                }
            }
        }
        u = result.length;
        v = result[u - 1];
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }

    const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
    function onActivated(hook, target) {
        registerKeepAliveHook(hook, "a" /* ACTIVATED */, target);
    }
    function onDeactivated(hook, target) {
        registerKeepAliveHook(hook, "da" /* DEACTIVATED */, target);
    }
    function registerKeepAliveHook(hook, type, target = currentInstance) {
        // cache the deactivate branch check wrapper for injected hooks so the same
        // hook can be properly deduped by the scheduler. "__wdc" stands for "with
        // deactivation check".
        const wrappedHook = hook.__wdc ||
            (hook.__wdc = () => {
                // only fire the hook if the target instance is NOT in a deactivated branch.
                let current = target;
                while (current) {
                    if (current.isDeactivated) {
                        return;
                    }
                    current = current.parent;
                }
                hook();
            });
        injectHook(type, wrappedHook, target);
        // In addition to registering it on the target instance, we walk up the parent
        // chain and register it on all ancestor instances that are keep-alive roots.
        // This avoids the need to walk the entire component tree when invoking these
        // hooks, and more importantly, avoids the need to track child components in
        // arrays.
        if (target) {
            let current = target.parent;
            while (current && current.parent) {
                if (isKeepAlive(current.parent.vnode)) {
                    injectToKeepAliveRoot(wrappedHook, type, target, current);
                }
                current = current.parent;
            }
        }
    }
    function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
        injectHook(type, hook, keepAliveRoot, true /* prepend */);
        onUnmounted(() => {
            remove(keepAliveRoot[type], hook);
        }, target);
    }

    function injectHook(type, hook, target = currentInstance, prepend = false) {
        if (target) {
            const hooks = target[type] || (target[type] = []);
            // cache the error handling wrapper for injected hooks so the same hook
            // can be properly deduped by the scheduler. "__weh" stands for "with error
            // handling".
            const wrappedHook = hook.__weh ||
                (hook.__weh = (...args) => {
                    if (target.isUnmounted) {
                        return;
                    }
                    // disable tracking inside all lifecycle hooks
                    // since they can potentially be called inside effects.
                    pauseTracking();
                    // Set currentInstance during hook invocation.
                    // This assumes the hook does not synchronously trigger other hooks, which
                    // can only be false when the user does something really funky.
                    setCurrentInstance(target);
                    const res = callWithAsyncErrorHandling(hook, target, type, args);
                    setCurrentInstance(null);
                    resetTracking();
                    return res;
                });
            if (prepend) {
                hooks.unshift(wrappedHook);
            }
            else {
                hooks.push(wrappedHook);
            }
        }
    }
    const createHook = (lifecycle) => (hook, target = currentInstance) => 
    // post-create lifecycle registrations are noops during SSR
    !isInSSRComponentSetup && injectHook(lifecycle, hook, target);
    const onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
    const onMounted = createHook("m" /* MOUNTED */);
    const onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
    const onUpdated = createHook("u" /* UPDATED */);
    const onBeforeUnmount = createHook("bum" /* BEFORE_UNMOUNT */);
    const onUnmounted = createHook("um" /* UNMOUNTED */);
    const onRenderTriggered = createHook("rtg" /* RENDER_TRIGGERED */);
    const onRenderTracked = createHook("rtc" /* RENDER_TRACKED */);
    const onErrorCaptured = (hook, target = currentInstance) => {
        injectHook("ec" /* ERROR_CAPTURED */, hook, target);
    };

    const invoke = (fn) => fn();
    // initial value for watchers to trigger on undefined initial values
    const INITIAL_WATCHER_VALUE = {};
    // implementation
    function watch(effectOrSource, cbOrOptions, options) {
        if (isFunction$1(cbOrOptions)) {
            // watch(source, cb)
            return doWatch(effectOrSource, cbOrOptions, options);
        }
        else {
            // watch(effect)
            return doWatch(effectOrSource, null, cbOrOptions);
        }
    }
    function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ$1) {
        const instance = currentInstance;
        const suspense = currentSuspense;
        let getter;
        if (isArray$1(source)) {
            getter = () => source.map(s => isRef(s)
                ? s.value
                : callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */));
        }
        else if (isRef(source)) {
            getter = () => source.value;
        }
        else if (cb) {
            // getter with cb
            getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */);
        }
        else {
            // no cb -> simple effect
            getter = () => {
                if (instance && instance.isUnmounted) {
                    return;
                }
                if (cleanup) {
                    cleanup();
                }
                return callWithErrorHandling(source, instance, 3 /* WATCH_CALLBACK */, [registerCleanup]);
            };
        }
        if (deep) {
            const baseGetter = getter;
            getter = () => traverse(baseGetter());
        }
        let cleanup;
        const registerCleanup = (fn) => {
            cleanup = runner.options.onStop = () => {
                callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */);
            };
        };
        let oldValue = isArray$1(source) ? [] : INITIAL_WATCHER_VALUE;
        const applyCb = cb
            ? () => {
                if (instance && instance.isUnmounted) {
                    return;
                }
                const newValue = runner();
                if (deep || hasChanged$1(newValue, oldValue)) {
                    // cleanup before running cb again
                    if (cleanup) {
                        cleanup();
                    }
                    callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                        newValue,
                        // pass undefined as the old value when it's changed for the first time
                        oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                        registerCleanup
                    ]);
                    oldValue = newValue;
                }
            }
            : void 0;
        let scheduler;
        if (flush === 'sync') {
            scheduler = invoke;
        }
        else if (flush === 'pre') {
            scheduler = job => {
                if (!instance || instance.vnode.el != null) {
                    queueJob(job);
                }
                else {
                    // with 'pre' option, the first call must happen before
                    // the component is mounted so it is called synchronously.
                    job();
                }
            };
        }
        else {
            scheduler = job => {
                queuePostRenderEffect(job, suspense);
            };
        }
        const runner = effect(getter, {
            lazy: true,
            // so it runs before component update effects in pre flush mode
            computed: true,
            onTrack,
            onTrigger,
            scheduler: applyCb ? () => scheduler(applyCb) : scheduler
        });
        recordInstanceBoundEffect(runner);
        // initial run
        if (applyCb) {
            if (immediate) {
                applyCb();
            }
            else {
                oldValue = runner();
            }
        }
        else {
            runner();
        }
        return () => {
            stop(runner);
            if (instance) {
                remove(instance.effects, runner);
            }
        };
    }
    // this.$watch
    function instanceWatch(source, cb, options) {
        const ctx = this.proxy;
        const getter = isString(source) ? () => ctx[source] : source.bind(ctx);
        const stop = watch(getter, cb.bind(ctx), options);
        onBeforeUnmount(stop, this);
        return stop;
    }
    function traverse(value, seen = new Set()) {
        if (!isObject$1(value) || seen.has(value)) {
            return;
        }
        seen.add(value);
        if (isArray$1(value)) {
            for (let i = 0; i < value.length; i++) {
                traverse(value[i], seen);
            }
        }
        else if (value instanceof Map) {
            value.forEach((v, key) => {
                // to register mutation dep for existing keys
                traverse(value.get(key), seen);
            });
        }
        else if (value instanceof Set) {
            value.forEach(v => {
                traverse(v, seen);
            });
        }
        else {
            for (const key in value) {
                traverse(value[key], seen);
            }
        }
        return value;
    }

    const publicPropertiesMap = {
        $: i => i,
        $el: i => i.vnode.el,
        $data: i => i.data,
        $props: i => i.propsProxy,
        $attrs: i => i.attrs,
        $slots: i => i.slots,
        $refs: i => i.refs,
        $parent: i => i.parent,
        $root: i => i.root,
        $emit: i => i.emit,
        $options: i => i.type,
        $forceUpdate: i => () => queueJob(i.update),
        $nextTick: () => nextTick,
        $watch:  i => instanceWatch.bind(i) 
    };
    const unwrapRef = (val) => (isRef(val) ? val.value : val);
    const PublicInstanceProxyHandlers = {
        get(target, key) {
            const { renderContext, data, props, propsProxy, accessCache, type, sink } = target;
            // data / props / renderContext
            // This getter gets called for every property access on the render context
            // during render and is a major hotspot. The most expensive part of this
            // is the multiple hasOwn() calls. It's much faster to do a simple property
            // access on a plain object, so we use an accessCache object (with null
            // prototype) to memoize what access type a key corresponds to.
            if (key[0] !== '$') {
                const n = accessCache[key];
                if (n !== undefined) {
                    switch (n) {
                        case 0 /* DATA */:
                            return data[key];
                        case 1 /* CONTEXT */:
                            return unwrapRef(renderContext[key]);
                        case 2 /* PROPS */:
                            return propsProxy[key];
                        // default: just fallthrough
                    }
                }
                else if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
                    accessCache[key] = 0 /* DATA */;
                    return data[key];
                }
                else if (hasOwn$1(renderContext, key)) {
                    accessCache[key] = 1 /* CONTEXT */;
                    return unwrapRef(renderContext[key]);
                }
                else if (type.props != null) {
                    // only cache other properties when instance has declared (this stable)
                    // props
                    if (hasOwn$1(props, key)) {
                        accessCache[key] = 2 /* PROPS */;
                        // return the value from propsProxy for ref unwrapping and readonly
                        return propsProxy[key];
                    }
                    else {
                        accessCache[key] = 3 /* OTHER */;
                    }
                }
            }
            // public $xxx properties & user-attached properties (sink)
            const publicGetter = publicPropertiesMap[key];
            let cssModule;
            if (publicGetter != null) {
                return publicGetter(target);
            }
            else if (
                (cssModule = type.__cssModules) != null &&
                (cssModule = cssModule[key])) {
                return cssModule;
            }
            else if (hasOwn$1(sink, key)) {
                return sink[key];
            }
        },
        has(target, key) {
            const { data, accessCache, renderContext, type, sink } = target;
            return (accessCache[key] !== undefined ||
                (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) ||
                hasOwn$1(renderContext, key) ||
                (type.props != null && hasOwn$1(type.props, key)) ||
                hasOwn$1(publicPropertiesMap, key) ||
                hasOwn$1(sink, key));
        },
        set(target, key, value) {
            const { data, renderContext } = target;
            if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
                data[key] = value;
            }
            else if (hasOwn$1(renderContext, key)) {
                // context is already reactive (user returned reactive object from setup())
                // just set directly
                if (isReactive(renderContext)) {
                    renderContext[key] = value;
                }
                else {
                    // handle potential ref set
                    const oldValue = renderContext[key];
                    if (isRef(oldValue) && !isRef(value)) {
                        oldValue.value = value;
                    }
                    else {
                        renderContext[key] = value;
                    }
                }
            }
            else if (key[0] === '$' && key.slice(1) in target) {
                return false;
            }
            else if (key in target.props) {
                return false;
            }
            else {
                target.sink[key] = value;
            }
            return true;
        }
    };

    function provide(key, value) {
        if (!currentInstance) ;
        else {
            let provides = currentInstance.provides;
            // by default an instance inherits its parent's provides object
            // but when it needs to provide values of its own, it creates its
            // own provides object using parent provides object as prototype.
            // this way in `inject` we can simply look up injections from direct
            // parent and let the prototype chain do the work.
            const parentProvides = currentInstance.parent && currentInstance.parent.provides;
            if (parentProvides === provides) {
                provides = currentInstance.provides = Object.create(parentProvides);
            }
            // TS doesn't allow symbol as index type
            provides[key] = value;
        }
    }
    function inject(key, defaultValue) {
        // fallback to `currentRenderingInstance` so that this can be called in
        // a functional component
        const instance = currentInstance || currentRenderingInstance;
        if (instance) {
            const provides = instance.provides;
            if (key in provides) {
                // TS doesn't allow symbol as index type
                return provides[key];
            }
            else if (defaultValue !== undefined) {
                return defaultValue;
            }
        }
    }
    function applyOptions(instance, options, asMixin = false) {
        const ctx = instance.proxy;
        const { 
        // composition
        mixins, extends: extendsOptions, 
        // state
        props: propsOptions, data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, 
        // assets
        components, directives, 
        // lifecycle
        beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeUnmount, unmounted, renderTracked, renderTriggered, errorCaptured } = options;
        const renderContext = instance.renderContext === EMPTY_OBJ$1
            ? (instance.renderContext = {})
            : instance.renderContext;
        const globalMixins = instance.appContext.mixins;
        // applyOptions is called non-as-mixin once per instance
        if (!asMixin) {
            callSyncHook('beforeCreate', options, ctx, globalMixins);
            // global mixins are applied first
            applyMixins(instance, globalMixins);
        }
        // extending a base component...
        if (extendsOptions) {
            applyOptions(instance, extendsOptions, true);
        }
        // local mixins
        if (mixins) {
            applyMixins(instance, mixins);
        }
        // state options
        if (dataOptions) {
            const data = isFunction$1(dataOptions) ? dataOptions.call(ctx) : dataOptions;
            if (!isObject$1(data)) ;
            else if (instance.data === EMPTY_OBJ$1) {
                instance.data = reactive(data);
            }
            else {
                // existing data: this is a mixin or extends.
                extend(instance.data, data);
            }
        }
        if (computedOptions) {
            for (const key in computedOptions) {
                const opt = computedOptions[key];
                if (isFunction$1(opt)) {
                    renderContext[key] = computed$1(opt.bind(ctx, ctx));
                }
                else {
                    const { get, set } = opt;
                    if (isFunction$1(get)) {
                        renderContext[key] = computed$1({
                            get: get.bind(ctx, ctx),
                            set: isFunction$1(set)
                                ? set.bind(ctx)
                                :  NOOP$1
                        });
                    }
                }
            }
        }
        if (methods) {
            for (const key in methods) {
                const methodHandler = methods[key];
                if (isFunction$1(methodHandler)) {
                    renderContext[key] = methodHandler.bind(ctx);
                }
            }
        }
        if (watchOptions) {
            for (const key in watchOptions) {
                createWatcher(watchOptions[key], renderContext, ctx, key);
            }
        }
        if (provideOptions) {
            const provides = isFunction$1(provideOptions)
                ? provideOptions.call(ctx)
                : provideOptions;
            for (const key in provides) {
                provide(key, provides[key]);
            }
        }
        if (injectOptions) {
            if (isArray$1(injectOptions)) {
                for (let i = 0; i < injectOptions.length; i++) {
                    const key = injectOptions[i];
                    renderContext[key] = inject(key);
                }
            }
            else {
                for (const key in injectOptions) {
                    const opt = injectOptions[key];
                    if (isObject$1(opt)) {
                        renderContext[key] = inject(opt.from, opt.default);
                    }
                    else {
                        renderContext[key] = inject(opt);
                    }
                }
            }
        }
        // asset options
        if (components) {
            extend(instance.components, components);
        }
        if (directives) {
            extend(instance.directives, directives);
        }
        // lifecycle options
        if (!asMixin) {
            callSyncHook('created', options, ctx, globalMixins);
        }
        if (beforeMount) {
            onBeforeMount(beforeMount.bind(ctx));
        }
        if (mounted) {
            onMounted(mounted.bind(ctx));
        }
        if (beforeUpdate) {
            onBeforeUpdate(beforeUpdate.bind(ctx));
        }
        if (updated) {
            onUpdated(updated.bind(ctx));
        }
        if (activated) {
            onActivated(activated.bind(ctx));
        }
        if (deactivated) {
            onDeactivated(deactivated.bind(ctx));
        }
        if (errorCaptured) {
            onErrorCaptured(errorCaptured.bind(ctx));
        }
        if (renderTracked) {
            onRenderTracked(renderTracked.bind(ctx));
        }
        if (renderTriggered) {
            onRenderTriggered(renderTriggered.bind(ctx));
        }
        if (beforeUnmount) {
            onBeforeUnmount(beforeUnmount.bind(ctx));
        }
        if (unmounted) {
            onUnmounted(unmounted.bind(ctx));
        }
    }
    function callSyncHook(name, options, ctx, globalMixins) {
        callHookFromMixins(name, globalMixins, ctx);
        const baseHook = options.extends && options.extends[name];
        if (baseHook) {
            baseHook.call(ctx);
        }
        const mixins = options.mixins;
        if (mixins) {
            callHookFromMixins(name, mixins, ctx);
        }
        const selfHook = options[name];
        if (selfHook) {
            selfHook.call(ctx);
        }
    }
    function callHookFromMixins(name, mixins, ctx) {
        for (let i = 0; i < mixins.length; i++) {
            const fn = mixins[i][name];
            if (fn) {
                fn.call(ctx);
            }
        }
    }
    function applyMixins(instance, mixins) {
        for (let i = 0; i < mixins.length; i++) {
            applyOptions(instance, mixins[i], true);
        }
    }
    function createWatcher(raw, renderContext, ctx, key) {
        const getter = () => ctx[key];
        if (isString(raw)) {
            const handler = renderContext[raw];
            if (isFunction$1(handler)) {
                watch(getter, handler);
            }
        }
        else if (isFunction$1(raw)) {
            watch(getter, raw.bind(ctx));
        }
        else if (isObject$1(raw)) {
            if (isArray$1(raw)) {
                raw.forEach(r => createWatcher(r, renderContext, ctx, key));
            }
            else {
                watch(getter, raw.handler.bind(ctx), raw);
            }
        }
    }

    const emptyAppContext = createAppContext();
    function createComponentInstance(vnode, parent) {
        // inherit parent app context - or - if root, adopt from root vnode
        const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
        const instance = {
            vnode,
            parent,
            appContext,
            type: vnode.type,
            root: null,
            next: null,
            subTree: null,
            update: null,
            render: null,
            proxy: null,
            withProxy: null,
            propsProxy: null,
            setupContext: null,
            effects: null,
            provides: parent ? parent.provides : Object.create(appContext.provides),
            accessCache: null,
            renderCache: [],
            // setup context properties
            renderContext: EMPTY_OBJ$1,
            data: EMPTY_OBJ$1,
            props: EMPTY_OBJ$1,
            attrs: EMPTY_OBJ$1,
            vnodeHooks: EMPTY_OBJ$1,
            slots: EMPTY_OBJ$1,
            refs: EMPTY_OBJ$1,
            // per-instance asset storage (mutable during options resolution)
            components: Object.create(appContext.components),
            directives: Object.create(appContext.directives),
            // async dependency management
            asyncDep: null,
            asyncResult: null,
            asyncResolved: false,
            // user namespace for storing whatever the user assigns to `this`
            // can also be used as a wildcard storage for ad-hoc injections internally
            sink: {},
            // lifecycle hooks
            // not using enums here because it results in computed properties
            isMounted: false,
            isUnmounted: false,
            isDeactivated: false,
            bc: null,
            c: null,
            bm: null,
            m: null,
            bu: null,
            u: null,
            um: null,
            bum: null,
            da: null,
            a: null,
            rtg: null,
            rtc: null,
            ec: null,
            emit: (event, ...args) => {
                const props = instance.vnode.props || EMPTY_OBJ$1;
                let handler = props[`on${event}`] || props[`on${capitalize(event)}`];
                if (!handler && event.indexOf('update:') === 0) {
                    event = hyphenate(event);
                    handler = props[`on${event}`] || props[`on${capitalize(event)}`];
                }
                if (handler) {
                    const res = callWithAsyncErrorHandling(handler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
                    return isArray$1(res) ? res : [res];
                }
                else {
                    return [];
                }
            }
        };
        instance.root = parent ? parent.root : instance;
        return instance;
    }
    let currentInstance = null;
    let currentSuspense = null;
    const setCurrentInstance = (instance) => {
        currentInstance = instance;
    };
    let isInSSRComponentSetup = false;
    function setupComponent(instance, parentSuspense, isSSR = false) {
        isInSSRComponentSetup = isSSR;
        const propsOptions = instance.type.props;
        const { props, children, shapeFlag } = instance.vnode;
        resolveProps(instance, props, propsOptions);
        resolveSlots(instance, children);
        // setup stateful logic
        let setupResult;
        if (shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            setupResult = setupStatefulComponent(instance, parentSuspense);
        }
        isInSSRComponentSetup = false;
        return setupResult;
    }
    function setupStatefulComponent(instance, parentSuspense) {
        const Component = instance.type;
        // 0. create render proxy property access cache
        instance.accessCache = {};
        // 1. create public instance / render proxy
        instance.proxy = new Proxy(instance, PublicInstanceProxyHandlers);
        // 2. create props proxy
        // the propsProxy is a reactive AND readonly proxy to the actual props.
        // it will be updated in resolveProps() on updates before render
        const propsProxy = (instance.propsProxy = isInSSRComponentSetup
            ? instance.props
            : shallowReadonly(instance.props));
        // 3. call setup()
        const { setup } = Component;
        if (setup) {
            const setupContext = (instance.setupContext =
                setup.length > 1 ? createSetupContext(instance) : null);
            currentInstance = instance;
            currentSuspense = parentSuspense;
            pauseTracking();
            const setupResult = callWithErrorHandling(setup, instance, 0 /* SETUP_FUNCTION */, [propsProxy, setupContext]);
            resetTracking();
            currentInstance = null;
            currentSuspense = null;
            if (isPromise(setupResult)) {
                if (isInSSRComponentSetup) {
                    // return the promise so server-renderer can wait on it
                    return setupResult.then(resolvedResult => {
                        handleSetupResult(instance, resolvedResult, parentSuspense);
                    });
                }
                else {
                    // async setup returned Promise.
                    // bail here and wait for re-entry.
                    instance.asyncDep = setupResult;
                }
            }
            else {
                handleSetupResult(instance, setupResult, parentSuspense);
            }
        }
        else {
            finishComponentSetup(instance, parentSuspense);
        }
    }
    function handleSetupResult(instance, setupResult, parentSuspense) {
        if (isFunction$1(setupResult)) {
            // setup returned an inline render function
            instance.render = setupResult;
        }
        else if (isObject$1(setupResult)) {
            // setup returned bindings.
            // assuming a render function compiled from template is present.
            instance.renderContext = setupResult;
        }
        finishComponentSetup(instance, parentSuspense);
    }
    function finishComponentSetup(instance, parentSuspense) {
        const Component = instance.type;
        if (!instance.render) {
            instance.render = (Component.render || NOOP$1);
        }
        // support for 2.x options
        {
            currentInstance = instance;
            currentSuspense = parentSuspense;
            applyOptions(instance, Component);
            currentInstance = null;
            currentSuspense = null;
        }
        if (instance.renderContext === EMPTY_OBJ$1) {
            instance.renderContext = {};
        }
    }
    // used to identify a setup context proxy
    const SetupProxySymbol = Symbol();
    const SetupProxyHandlers = {};
    ['attrs', 'slots'].forEach((type) => {
        SetupProxyHandlers[type] = {
            get: (instance, key) => {
                return instance[type][key];
            },
            has: (instance, key) => key === SetupProxySymbol || key in instance[type],
            ownKeys: instance => Reflect.ownKeys(instance[type]),
            // this is necessary for ownKeys to work properly
            getOwnPropertyDescriptor: (instance, key) => Reflect.getOwnPropertyDescriptor(instance[type], key),
            set: () => false,
            deleteProperty: () => false
        };
    });
    function createSetupContext(instance) {
        const context = {
            // attrs & slots are non-reactive, but they need to always expose
            // the latest values (instance.xxx may get replaced during updates) so we
            // need to expose them through a proxy
            attrs: new Proxy(instance, SetupProxyHandlers.attrs),
            slots: new Proxy(instance, SetupProxyHandlers.slots),
            get emit() {
                return instance.emit;
            }
        };
        return  context;
    }
    // record effects created during a component's setup() so that they can be
    // stopped when the component unmounts
    function recordInstanceBoundEffect(effect) {
        if (currentInstance) {
            (currentInstance.effects || (currentInstance.effects = [])).push(effect);
        }
    }

    function computed$1(getterOrOptions) {
        const c = computed(getterOrOptions);
        recordInstanceBoundEffect(c.effect);
        return c;
    }
    const camelize$1 = camelize;

    const doc = (typeof document !== 'undefined' ? document : null);
    const svgNS = 'http://www.w3.org/2000/svg';
    let tempContainer;
    let tempSVGContainer;
    const nodeOps = {
        insert: (child, parent, anchor) => {
            if (anchor != null) {
                parent.insertBefore(child, anchor);
            }
            else {
                parent.appendChild(child);
            }
        },
        remove: child => {
            const parent = child.parentNode;
            if (parent != null) {
                parent.removeChild(child);
            }
        },
        createElement: (tag, isSVG) => isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag),
        createText: text => doc.createTextNode(text),
        createComment: text => doc.createComment(text),
        setText: (node, text) => {
            node.nodeValue = text;
        },
        setElementText: (el, text) => {
            el.textContent = text;
        },
        parentNode: node => node.parentNode,
        nextSibling: node => node.nextSibling,
        querySelector: selector => doc.querySelector(selector),
        setScopeId(el, id) {
            el.setAttribute(id, '');
        },
        cloneNode(el) {
            return el.cloneNode(true);
        },
        // __UNSAFE__
        // Reason: innerHTML.
        // Static content here can only come from compiled templates.
        // As long as the user only uses trusted templates, this is safe.
        insertStaticContent(content, parent, anchor, isSVG) {
            const temp = isSVG
                ? tempSVGContainer ||
                    (tempSVGContainer = doc.createElementNS(svgNS, 'svg'))
                : tempContainer || (tempContainer = doc.createElement('div'));
            temp.innerHTML = content;
            const node = temp.children[0];
            nodeOps.insert(node, parent, anchor);
            return node;
        }
    };

    // compiler should normalize class + :class bindings on the same element
    // into a single binding ['staticClass', dynamic]
    function patchClass(el, value, isSVG) {
        if (value == null) {
            value = '';
        }
        // directly setting className should be faster than setAttribute in theory
        if (isSVG) {
            el.setAttribute('class', value);
        }
        else {
            // if this is an element during a transition, take the temporary transition
            // classes into account.
            const transitionClasses = el._vtc;
            if (transitionClasses) {
                value = [value, ...transitionClasses].join(' ');
            }
            el.className = value;
        }
    }

    // Make a map and return a function for checking if a key
    // is in that map.
    //
    // IMPORTANT: all calls of this function must be prefixed with /*#__PURE__*/
    // So that rollup can tree-shake them if necessary.
    function makeMap$2(str, expectsLowerCase) {
        const map = Object.create(null);
        const list = str.split(',');
        for (let i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
    }

    // On the client we only need to offer special cases for boolean attributes that
    // have different names from their corresponding dom properties:
    // - itemscope -> N/A
    // - allowfullscreen -> allowFullscreen
    // - formnovalidate -> formNoValidate
    // - ismap -> isMap
    // - nomodule -> noModule
    // - novalidate -> noValidate
    // - readonly -> readOnly
    const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
    const isSpecialBooleanAttr = /*#__PURE__*/ makeMap$2(specialBooleanAttrs);

    const EMPTY_OBJ$2 =  {};
    const isOn = (key) => key[0] === 'o' && key[1] === 'n';
    const isString$1 = (val) => typeof val === 'string';
    const cacheStringFunction$1 = (fn) => {
        const cache = Object.create(null);
        return ((str) => {
            const hit = cache[str];
            return hit || (cache[str] = fn(str));
        });
    };
    const hyphenateRE$1 = /\B([A-Z])/g;
    const hyphenate$1 = cacheStringFunction$1((str) => {
        return str.replace(hyphenateRE$1, '-$1').toLowerCase();
    });
    const capitalize$1 = cacheStringFunction$1((str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    function patchStyle(el, prev, next) {
        const style = el.style;
        if (!next) {
            el.removeAttribute('style');
        }
        else if (isString$1(next)) {
            style.cssText = next;
        }
        else {
            for (const key in next) {
                setStyle(style, key, next[key]);
            }
            if (prev && !isString$1(prev)) {
                for (const key in prev) {
                    if (!next[key]) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
    }
    const importantRE = /\s*!important$/;
    function setStyle(style, name, val) {
        if (name.startsWith('--')) {
            // custom property definition
            style.setProperty(name, val);
        }
        else {
            const prefixed = autoPrefix(style, name);
            if (importantRE.test(val)) {
                // !important
                style.setProperty(hyphenate$1(prefixed), val.replace(importantRE, ''), 'important');
            }
            else {
                style[prefixed] = val;
            }
        }
    }
    const prefixes = ['Webkit', 'Moz', 'ms'];
    const prefixCache = {};
    function autoPrefix(style, rawName) {
        const cached = prefixCache[rawName];
        if (cached) {
            return cached;
        }
        let name = camelize$1(rawName);
        if (name !== 'filter' && name in style) {
            return (prefixCache[rawName] = name);
        }
        name = capitalize$1(name);
        for (let i = 0; i < prefixes.length; i++) {
            const prefixed = prefixes[i] + name;
            if (prefixed in style) {
                return (prefixCache[rawName] = prefixed);
            }
        }
        return rawName;
    }

    const xlinkNS = 'http://www.w3.org/1999/xlink';
    function patchAttr(el, key, value, isSVG) {
        if (isSVG && key.indexOf('xlink:') === 0) {
            if (value == null) {
                el.removeAttributeNS(xlinkNS, key);
            }
            else {
                el.setAttributeNS(xlinkNS, key, value);
            }
        }
        else {
            // note we are only checking boolean attributes that don't have a
            // correspoding dom prop of the same name here.
            const isBoolean = isSpecialBooleanAttr(key);
            if (value == null || (isBoolean && value === false)) {
                el.removeAttribute(key);
            }
            else {
                el.setAttribute(key, isBoolean ? '' : value);
            }
        }
    }

    // __UNSAFE__
    // Reason: potentially setting innerHTML.
    // This can come from explicit usage of v-html or innerHTML as a prop in render
    // functions. The user is reponsible for using them with only trusted content.
    function patchDOMProp(el, key, value, 
    // the following args are passed only due to potential innerHTML/textContent
    // overriding existing VNodes, in which case the old tree must be properly
    // unmounted.
    prevChildren, parentComponent, parentSuspense, unmountChildren) {
        if ((key === 'innerHTML' || key === 'textContent') && prevChildren != null) {
            unmountChildren(prevChildren, parentComponent, parentSuspense);
            el[key] = value == null ? '' : value;
            return;
        }
        if (key === 'value' && el.tagName !== 'PROGRESS') {
            // store value as _value as well since
            // non-string values will be stringified.
            el._value = value;
            el.value = value == null ? '' : value;
            return;
        }
        if (value === '' && typeof el[key] === 'boolean') {
            // e.g. <select multiple> compiles to { multiple: '' }
            el[key] = true;
        }
        else {
            el[key] = value == null ? '' : value;
        }
    }

    // Async edge case fix requires storing an event listener's attach timestamp.
    let _getNow = Date.now;
    // Determine what event timestamp the browser is using. Annoyingly, the
    // timestamp can either be hi-res ( relative to page load) or low-res
    // (relative to UNIX epoch), so in order to compare time we have to use the
    // same timestamp type when saving the flush timestamp.
    if (typeof document !== 'undefined' &&
        _getNow() > document.createEvent('Event').timeStamp) {
        // if the low-res timestamp which is bigger than the event timestamp
        // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
        // and we need to use the hi-res version for event listeners as well.
        _getNow = () => performance.now();
    }
    // To avoid the overhead of repeatedly calling performance.now(), we cache
    // and use the same timestamp for all event listeners attached in the same tick.
    let cachedNow = 0;
    const p$1 = Promise.resolve();
    const reset = () => {
        cachedNow = 0;
    };
    const getNow = () => cachedNow || (p$1.then(reset), (cachedNow = _getNow()));
    function addEventListener(el, event, handler, options) {
        el.addEventListener(event, handler, options);
    }
    function removeEventListener(el, event, handler, options) {
        el.removeEventListener(event, handler, options);
    }
    function patchEvent(el, name, prevValue, nextValue, instance = null) {
        const prevOptions = prevValue && 'options' in prevValue && prevValue.options;
        const nextOptions = nextValue && 'options' in nextValue && nextValue.options;
        const invoker = prevValue && prevValue.invoker;
        const value = nextValue && 'handler' in nextValue ? nextValue.handler : nextValue;
        if (prevOptions || nextOptions) {
            const prev = prevOptions || EMPTY_OBJ$2;
            const next = nextOptions || EMPTY_OBJ$2;
            if (prev.capture !== next.capture ||
                prev.passive !== next.passive ||
                prev.once !== next.once) {
                if (invoker) {
                    removeEventListener(el, name, invoker, prev);
                }
                if (nextValue && value) {
                    const invoker = createInvoker(value, instance);
                    nextValue.invoker = invoker;
                    addEventListener(el, name, invoker, next);
                }
                return;
            }
        }
        if (nextValue && value) {
            if (invoker) {
                prevValue.invoker = null;
                invoker.value = value;
                nextValue.invoker = invoker;
                invoker.lastUpdated = getNow();
            }
            else {
                addEventListener(el, name, createInvoker(value, instance), nextOptions || void 0);
            }
        }
        else if (invoker) {
            removeEventListener(el, name, invoker, prevOptions || void 0);
        }
    }
    function createInvoker(initialValue, instance) {
        const invoker = (e) => {
            // async edge case #6566: inner click event triggers patch, event handler
            // attached to outer element during patch, and triggered again. This
            // happens because browsers fire microtask ticks between event propagation.
            // the solution is simple: we save the timestamp when a handler is attached,
            // and the handler would only fire if the event passed to it was fired
            // AFTER it was attached.
            if (e.timeStamp >= invoker.lastUpdated - 1) {
                callWithAsyncErrorHandling(invoker.value, instance, 5 /* NATIVE_EVENT_HANDLER */, [e]);
            }
        };
        invoker.value = initialValue;
        initialValue.invoker = invoker;
        invoker.lastUpdated = getNow();
        return invoker;
    }

    const patchProp = (el, key, nextValue, prevValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
        switch (key) {
            // special
            case 'class':
                patchClass(el, nextValue, isSVG);
                break;
            case 'style':
                patchStyle(el, prevValue, nextValue);
                break;
            case 'modelValue':
            case 'onUpdate:modelValue':
                // Do nothing. This is handled by v-model directives.
                break;
            default:
                if (isOn(key)) {
                    patchEvent(el, key.slice(2).toLowerCase(), prevValue, nextValue, parentComponent);
                }
                else if (!isSVG && key in el) {
                    patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
                }
                else {
                    // special case for <input v-model type="checkbox"> with
                    // :true-value & :false-value
                    // store value as dom properties since non-string values will be
                    // stringified.
                    if (key === 'true-value') {
                        el._trueValue = nextValue;
                    }
                    else if (key === 'false-value') {
                        el._falseValue = nextValue;
                    }
                    patchAttr(el, key, nextValue, isSVG);
                }
                break;
        }
    };

    const rendererOptions = {
        patchProp,
        ...nodeOps
    };
    // lazy create the renderer - this makes core renderer logic tree-shakable
    // in case the user only imports reactivity utilities from Vue.
    let renderer;
    function ensureRenderer() {
        return renderer || (renderer = createRenderer(rendererOptions));
    }
    const createApp = ((...args) => {
        const app = ensureRenderer().createApp(...args);
        const { mount } = app;
        app.mount = (containerOrSelector) => {
            const container = normalizeContainer(containerOrSelector);
            if (!container)
                return;
            const component = app._component;
            // clear content before mounting
            container.innerHTML = '';
            return mount(container);
        };
        return app;
    });
    function normalizeContainer(container) {
        if (isString$1(container)) {
            const res = document.querySelector(container);
            return res;
        }
        return container;
    }

    var App = {
      setup: function setup() {
        onMounted(function () {
          console.log('main app mounted');
        });
      }
    };
    var app = createApp(App);
    app.component('foo', {
      setup: function setup() {
        onMounted(function () {
          console.log('foo mounted');
        });
      },
      template: '<div>I am foo</div>' // using the render function produces the same results
      // render() {
      //   return 'I am foo';
      // }

    });
    app.mount('#app');

}());
//# sourceMappingURL=app.js.map
