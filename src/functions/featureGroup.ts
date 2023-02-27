import { propsToLeafletOptions } from "../utils";
import { layerGroupProps, setupLayerGroup } from "./layerGroup";

export const featureGroupProps = {
  ...layerGroupProps,
};

export const setupFeatureGroup = (props, leafletRef) => {
  const { options: layerOptions, methods: layerGroupMethods } = setupLayerGroup(
    props,
    leafletRef
  );

  const options = propsToLeafletOptions(props, featureGroupProps, layerOptions);

  const methods = {
    ...layerGroupMethods,
  };

  return { options, methods };
};
