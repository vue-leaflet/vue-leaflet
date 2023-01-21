import { props as controlProps, setup as controlSetup } from "./control";

export const props = {
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

export const setup = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = controlSetup(
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
