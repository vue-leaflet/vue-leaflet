import type L from "leaflet";
import { provide } from "vue";

import {
  AddLayerInjection,
  RemoveLayerInjection,
} from "@src/types/injectionKeys";
import { propsToLeafletOptions } from "@src/utils";

import { layerProps, setupLayer } from "./layer";

export const layerGroupProps = {
  ...layerProps,
} as const;

export const setupLayerGroup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.InteractiveLayerOptions>(
    props,
    layerGroupProps,
    layerOptions
  );

  const methods = {
    ...layerMethods,
    addLayer(layer) {
      leafletRef.value.addLayer(layer.leafletObject);
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };

  provide(AddLayerInjection, methods.addLayer);
  provide(RemoveLayerInjection, methods.removeLayer);

  return { options, methods };
};
