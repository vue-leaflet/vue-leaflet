import { onBeforeUnmount, inject } from "vue";
import { props as layerProps, setup as layerSetup } from "./layer";
import {
  props as interactiveLayerProps,
  setup as interactiveLayerSetup,
} from "./interactiveLayer";

export const props = {
  ...layerProps,
  ...interactiveLayerProps,
  stroke: {
    type: Boolean,
    custom: true,
    default: true,
  },
  color: {
    type: String,
    custom: true,
    default: "#3388ff",
  },
  weight: {
    type: Number,
    custom: true,
    default: 3,
  },
  opacity: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  lineCap: {
    type: String,
    custom: true,
    default: "round",
  },
  lineJoin: {
    type: String,
    custom: true,
    default: "round",
  },
  dashArray: {
    type: String,
    custom: true,
    default: null,
  },
  dashOffset: {
    type: String,
    custom: true,
    default: null,
  },
  fill: {
    type: Boolean,
    custom: true,
    default: false,
  },
  fillColor: {
    type: String,
    custom: true,
    default: "#3388ff",
  },
  fillOpacity: {
    type: Number,
    custom: true,
    default: 0.2,
  },
  fillRule: {
    type: String,
    custom: true,
    default: "evenodd",
  },
  className: {
    type: String,
    custom: true,
    default: null,
  },
};

export const setup = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = layerSetup(
    props,
    leafletRef,
    context
  );
  const {
    options: interactiveLayerOptions,
    methods: interactiveLayerMethods,
  } = interactiveLayerSetup(props, leafletRef, context);

  const removeLayer = inject("removeLayer");

  const options = {
    ...layerOptions,
    ...interactiveLayerOptions,
    stroke: props.stroke,
    color: props.color,
    weight: props.weight,
    opacity: props.opacity,
    lineCap: props.lineCap,
    lineJoin: props.lineJoin,
    dashArray: props.dashArray,
    dashOffset: props.dashOffset,
    fill: props.fill,
    fillColor: props.fillColor,
    fillOpacity: props.fillOpacity,
    fillRule: props.fillRule,
    className: props.className,
  };
  const methods = {
    ...layerMethods,
    ...interactiveLayerMethods,
    setStroke(stroke) {
      leafletRef.value.setStyle({ stroke });
    },
    setColor(color) {
      leafletRef.value.setStyle({ color });
    },
    setWeight(weight) {
      leafletRef.value.setStyle({ weight });
    },
    setOpacity(opacity) {
      leafletRef.value.setStyle({ opacity });
    },
    setLineCap(lineCap) {
      leafletRef.value.setStyle({ lineCap });
    },
    setLineJoin(lineJoin) {
      leafletRef.value.setStyle({ lineJoin });
    },
    setDashArray(dashArray) {
      leafletRef.value.setStyle({ dashArray });
    },
    setDashOffset(dashOffset) {
      leafletRef.value.setStyle({ dashOffset });
    },
    setFill(fill) {
      leafletRef.value.setStyle({ fill });
    },
    setFillColor(fillColor) {
      leafletRef.value.setStyle({ fillColor });
    },
    setFillOpacity(fillOpacity) {
      leafletRef.value.setStyle({ fillOpacity });
    },
    setFillRule(fillRule) {
      leafletRef.value.setStyle({ fillRule });
    },
    setClassName(className) {
      leafletRef.value.setStyle({ className });
    },
  };

  onBeforeUnmount(() => {
    removeLayer({ leafletObject: leafletRef.value });
  });

  return { options, methods };
};
