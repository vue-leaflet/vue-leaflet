import { props as layerProps, setup as layerSetup } from "./layer";

export const props = {
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

export const setup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
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
