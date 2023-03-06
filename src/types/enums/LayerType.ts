import type { ObjectValues } from "../utilityTypes";

const LAYER_TYPE = {
  BASE: "base",
  OVERLAY: "overlay",
} as const;

export type LayerType = ObjectValues<typeof LAYER_TYPE>;
