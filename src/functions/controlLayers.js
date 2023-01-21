import { controlProps, setupControl } from "./control";

export const controlLayersProps = {
  ...controlProps,
  collapsed: {
    type: Boolean,
  },
  autoZIndex: {
    type: Boolean,
  },
  hideSingleBase: {
    type: Boolean,
  },
  sortLayers: {
    type: Boolean,
  },
  sortFunction: {
    type: Function,
  },
};

export const setupControlLayers = (props, leafletRef) => {
  const { options: controlOptions } = setupControl(props, leafletRef);
  const options = {
    ...controlOptions,
    collapsed: props.collapsed,
    autoZIndex: props.autoZIndex,
    hideSingleBase: props.hideSingleBase,
    sortLayers: props.sortLayers,
    sortFunction: props.sortFunction,
  };

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
