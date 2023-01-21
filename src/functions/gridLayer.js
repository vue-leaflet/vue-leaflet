import { layerProps, setupLayer } from "./layer";

export const gridLayerProps = {
  ...layerProps,
  pane: {
    type: String,
  },
  opacity: {
    type: Number,
  },
  zIndex: {
    type: Number,
  },
  tileSize: {
    type: Number,
  },
  noWrap: {
    type: Boolean,
  },
  minZoom: {
    type: Number,
  },
  maxZoom: {
    type: Number,
  },
};

export const setupGridLayer = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    pane: props.pane,
    opacity: props.opacity,
    zIndex: props.zIndex,
    tileSize: props.tileSize,
    noWrap: props.noWrap,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
  };
  return { options, methods: { ...layerMethods } };
};
