import { onUnmounted, h } from "vue";
import { props as componentProps, setup as componentSetup } from "./component";

export const props = {
  ...componentProps,
  position: {
    type: String,
    default: "topright",
  },
};

export const setup = (props, leafletRef) => {
  const {
    options: componentOptions,
    methods: componentMethods,
  } = componentSetup(props);
  const options = {
    ...componentOptions,
    position: props.position,
  };

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
