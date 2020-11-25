import { watch, ref, provide } from "vue";

export const debounce = (fn, time) => {
  let timeout;

  return function (...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn.apply(context, args);
      timeout = null;
    }, time);
  };
};

export const capitalizeFirstLetter = (string) => {
  if (!string || typeof string.charAt !== "function") {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

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
