import {
  props as layerGroupProps,
  setup as layerGroupSetup,
} from "./layerGroup";

export const props = {
  ...layerGroupProps,
};

export const setup = (props, leafletRef) => {
  const { options: layerOptions, methods: layerGroupMethods } = layerGroupSetup(
    props,
    leafletRef
  );

  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerGroupMethods,
  };

  return { options, methods };
};
