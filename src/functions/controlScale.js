import { propsToLeafletOptions } from "../utils";
import { controlProps, setupControl } from "./control";

export const controlScaleProps = {
  ...controlProps,
  maxWidth: {
    type: Number,
  },
  metric: {
    type: Boolean,
    default: undefined,
  },
  imperial: {
    type: Boolean,
    default: undefined,
  },
  updateWhenIdle: {
    type: Boolean,
    default: undefined,
  },
};

export const setupControlScale = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
    props,
    leafletRef
  );

  const options = propsToLeafletOptions(
    props,
    controlScaleProps,
    controlOptions
  );

  return { options, methods: controlMethods };
};
