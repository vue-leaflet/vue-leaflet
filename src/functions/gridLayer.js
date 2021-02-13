import { props as layerProps, setup as layerSetup } from "./layer";

export const props = {
  ...layerProps,
  pane: {
    type: String,
    default: "tilePane",
  },
  opacity: {
    type: Number,
    custom: false,
    default: 1.0,
  },
  zIndex: {
    type: Number,
    default: 1,
  },
  tileSize: {
    type: Number,
    default: 256,
  },
  noWrap: {
    type: Boolean,
    default: false,
  },
  minZoom: {
    type: Number,
    default: 0,
  },
  maxZoom: {
    type: Number,
    default: undefined,
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
