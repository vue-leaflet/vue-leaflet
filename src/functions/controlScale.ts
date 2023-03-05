import type L from "leaflet";

import { propsToLeafletOptions } from "@src/utils";

import { controlProps, setupControl } from "./control";

export const controlScaleProps = {
  ...controlProps,
  maxWidth: {
    type: Number,
  },
  metric: {
    type: Boolean,
    default: undefined,
  },
  imperial: {
    type: Boolean,
    default: undefined,
  },
  updateWhenIdle: {
    type: Boolean,
    default: undefined,
  },
} as const;

export const setupControlScale = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setupControl(
    props,
    leafletRef
  );

  const options = propsToLeafletOptions<L.Control.ScaleOptions>(
    props,
    controlScaleProps,
    controlOptions
  );

  return { options, methods: controlMethods };
};
