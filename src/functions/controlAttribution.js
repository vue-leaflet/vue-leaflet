import { props as controlProps, setup as controlSetup } from "./control";

export const props = {
  ...controlProps,
  prefix: {
    type: String,
    default: "Vue-Leaflet",
    custom: true,
  },
};

export const setup = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = controlSetup(
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
