import { controlProps, setupControl } from "./control";

export const controlScaleProps = {
  ...controlProps,
  maxWidth: {
    type: Number,
  },
  metric: {
    type: Boolean,
  },
  imperial: {
    type: Boolean,
  },
  updateWhenIdle: {
    type: Boolean,
  },
};

export const setupControlScale = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    maxWidth: props.maxWidth,
    metric: props.metric,
    imperial: props.imperial,
    updateWhenIdle: props.updateWhenIdle,
  };

  return { options, methods: controlMethods };
};
