import { propsToLeafletOptions } from "../utils";
import { controlProps, setupControl } from "./control";

export const controlLayersProps = {
  ...controlProps,
  collapsed: {
    type: Boolean,
    default: undefined,
  },
  autoZIndex: {
    type: Boolean,
    default: undefined,
  },
  hideSingleBase: {
    type: Boolean,
    default: undefined,
  },
  sortLayers: {
    type: Boolean,
    default: undefined,
  },
  sortFunction: {
    type: Function,
  },
};

export const setupControlLayers = (props, leafletRef) => {
  const { options: controlOptions } = setupControl(props, leafletRef);

  const options = propsToLeafletOptions(
    props,
    controlLayersProps,
    controlOptions
  );

  const methods = {
    addLayer(layer) {
      if (layer.layerType === "base") {
        leafletRef.value.addBaseLayer(layer.leafletObject, layer.name);
      } else if (layer.layerType === "overlay") {
        leafletRef.value.addOverlay(layer.leafletObject, layer.name);
      }
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };

  return { options, methods };
};
