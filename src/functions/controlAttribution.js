import { controlProps, setupControl } from "./control";

export const controlAttributionProps = {
  ...controlProps,
  prefix: {
    type: String,
  },
};

export const setupControlAttribution = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    prefix: props.prefix,
  };

  const methods = {
    ...controlMethods,
    setPrefix(prefix) {
      leafletRef.value.setPrefix(prefix);
    },
  };

  return { options, methods };
};
