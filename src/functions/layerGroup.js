import { provide } from "vue";
import { props as layerProps, setup as layerSetup } from "./layer";

export const props = {
  ...layerProps,
};

export const setup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    props,
    leafletRef,
    context
  );

  const options = {
    ...layerOptions,
  };

  const methods = {
    ...layerMethods,
    addLayer(layer) {
      leafletRef.value.addLayer(layer.leafletObject);
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };

  provide("addLayer", methods.addLayer);
  provide("removeLayer", methods.removeLayer);

  return { options, methods };
};
