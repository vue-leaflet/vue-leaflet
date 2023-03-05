import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { layerGroupProps, setupLayerGroup } from "./layerGroup";

export const featureGroupProps = {
  ...layerGroupProps,
} as const;

export const setupFeatureGroup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerGroupMethods } = setupLayerGroup(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.InteractiveLayerOptions>(
    props,
    featureGroupProps,
    layerOptions
  );

  const methods = {
    ...layerGroupMethods,
  };

  return { options, methods };
};
