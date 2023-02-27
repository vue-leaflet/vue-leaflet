import { h } from "vue";
import { componentProps, setupComponent } from "./component";

export const popperProps = {
  ...componentProps,
  content: {
    type: String,
    default: null,
  },
};

export const setupPopper = (props, leafletRef) => {
  const { options, methods: componentMethods } = setupComponent(props);

  const methods = {
    ...componentMethods,
    setContent(newVal) {
      if (leafletRef.value && newVal !== null && newVal !== undefined) {
        leafletRef.value.setContent(newVal);
      }
    },
  };

  return { options, methods };
};

export const render = (slots) => {
  if (slots.default) {
    return h("div", { ref: "root" }, slots.default());
  }
  return null;
};
