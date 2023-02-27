import { provide } from "vue";
import { propsToLeafletOptions } from "../utils";
import { layerProps, setupLayer } from "./layer";
import {
  AddLayerInjection,
  RemoveLayerInjection,
} from "@src/types/injectionKeys";

export const layerGroupProps = {
  ...layerProps,
};

export const setupLayerGroup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions(props, layerGroupProps, layerOptions);

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
