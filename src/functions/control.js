import { onUnmounted, h } from "vue";
import { propsToLeafletOptions } from "../utils";
import { componentProps, setupComponent } from "./component";

export const controlProps = {
  ...componentProps,
  position: {
    type: String,
  },
};

export const setupControl = (props, leafletRef) => {
  const {
    options: componentOptions,
    methods: componentMethods,
  } = setupComponent(props);

  const options = propsToLeafletOptions(props, controlProps, componentOptions);

  const methods = {
    ...componentMethods,
    setPosition(position) {
      if (leafletRef.value) {
        leafletRef.value.setPosition(position);
      }
    },
  };

  onUnmounted(() => {
    if (leafletRef.value) {
      leafletRef.value.remove();
    }
  });

  return { options, methods };
};

export const render = (slots) => {
  if (slots.default) {
    return h("div", { ref: "root" }, slots.default());
  }

  return null;
};
