import { setOptions } from "leaflet";
import { watch } from "vue";

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
    } else if (setMethodName === "setOptions") {
      watch(
        () => props[key],
        (newVal) => {
          setOptions(leafletElement, newVal);
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

export const collectionCleaner = (options) => {
  const result = {};
  for (const key in options) {
    const value = options[key];
    if (value !== null && value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export const optionsMerger = (props, instance) => {
  const options =
    instance.options && instance.options.constructor === Object
      ? instance.options
      : {};
  props = props && props.constructor === Object ? props : {};
  const result = collectionCleaner(options);
  props = collectionCleaner(props);
  const defaultProps = instance.$options.props;
  for (const key in props) {
    const def = defaultProps[key]
      ? defaultProps[key].default &&
        typeof defaultProps[key].default === "function"
        ? defaultProps[key].default.call()
        : defaultProps[key].default
      : Symbol("unique");
    let isEqual = false;
    if (Array.isArray(def)) {
      isEqual = JSON.stringify(def) === JSON.stringify(props[key]);
    } else {
      isEqual = def === props[key];
    }
    if (result[key] && !isEqual) {
      console.warn(
        `${key} props is overriding the value passed in the options props`
      );
      result[key] = props[key];
    } else if (!result[key]) {
      result[key] = props[key];
    }
  }
  return result;
};

export const remapEvents = (onEvent) => {
  const result = {};
  for (const eventName in onEvent) {
    const newName = eventName.replace("on", "").toLowerCase();
    result[newName] = onEvent[eventName];
  }
  return result;
};
