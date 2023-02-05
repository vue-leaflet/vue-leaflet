import { watch, ref, provide } from "vue";

export const debounce = (fn, time = 100) => {
  let timeout;

  const debounced = function (...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn.apply(context, args);
      timeout = null;
    }, time);
  };

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return debounced;
};

export const cancelDebounces = function (handlerMethods) {
  for (const handler of Object.values(handlerMethods)) {
    handler && isFunction(handler.cancel) && handler.cancel();
  }
};

export const capitalizeFirstLetter = (string) => {
  if (!string || typeof string.charAt !== "function") {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const isFunction = (x) => typeof x === "function";

export const propsBinder = (methods, leafletElement, props) => {
  for (const key in props) {
    const setMethodName = "set" + capitalizeFirstLetter(key);
    if (methods[setMethodName]) {
      watch(
        () => props[key],
        (newVal, oldVal) => {
          methods[setMethodName](newVal, oldVal);
        }
      );
    } else if (leafletElement[setMethodName]) {
      watch(
        () => props[key],
        (newVal) => {
          leafletElement[setMethodName](newVal);
        }
      );
    }
  }
};

export const propsToLeafletOptions = (
  propValues,
  propDefinitions,
  baseOptions = {}
) => {
  const output = { ...baseOptions };

  for (const prop in propValues) {
    const defn = propDefinitions[prop];
    const val = propValues[prop];

    // Unexpected props should not be converted to Leaflet options.
    if (!defn) continue;
    // Custom vue-leaflet props should not be passed to Leaflet.
    if (defn && defn.custom === true) continue;
    // Exclude undefined values so that Leaflet uses its own defaults.
    if (val === undefined) continue;

    output[prop] = val;
  }

  return output;
};

export const remapEvents = (contextAttrs) => {
  const result = {};
  for (const attrName in contextAttrs) {
    if (
      attrName.startsWith("on") &&
      !attrName.startsWith("onUpdate") &&
      attrName !== "onReady"
    ) {
      const eventName = attrName.slice(2).toLocaleLowerCase();
      result[eventName] = contextAttrs[attrName];
    }
  }
  return result;
};

export const resetWebpackIcon = async (Icon) => {
  const modules = await Promise.all([
    import("leaflet/dist/images/marker-icon-2x.png"),
    import("leaflet/dist/images/marker-icon.png"),
    import("leaflet/dist/images/marker-shadow.png"),
  ]);

  delete Icon.Default.prototype._getIconUrl;

  Icon.Default.mergeOptions({
    iconRetinaUrl: modules[0].default,
    iconUrl: modules[1].default,
    shadowUrl: modules[2].default,
  });
};

/**
 * Wraps a placeholder function and provides it with the given name.
 * The wrapper can later be updated with {@link updateLeafletWrapper}
 * to provide a different function.
 *
 * @param {String} methodName Key used to provide the wrapper function
 */
export const provideLeafletWrapper = (methodName) => {
  const wrapped = ref(() =>
    console.warn(`Method ${methodName} has been invoked without being replaced`)
  );
  const wrapper = (...args) => wrapped.value(...args);
  // eslint-disable-next-line vue/no-ref-as-operand
  wrapper.wrapped = wrapped;
  provide(methodName, wrapper);

  return wrapper;
};

/**
 * Change the function that will be executed when an injected Leaflet wrapper
 * is invoked.
 *
 * @param {*} wrapper Provided wrapper whose wrapped function is to be updated
 * @param {function} leafletMethod New method to be wrapped by the wrapper
 */
export const updateLeafletWrapper = (wrapper, leafletMethod) =>
  (wrapper.wrapped.value = leafletMethod);

export const WINDOW_OR_GLOBAL =
  (typeof self === "object" && self.self === self && self) ||
  (typeof global === "object" && global.global === global && global) ||
  undefined;

export const GLOBAL_LEAFLET_OPT = "useGlobalLeaflet";
