import type L from "leaflet";

import type { LayerType } from "../enums/LayerType";

export interface ILayerDefinition<T extends L.Layer = L.Layer> {
  name?: string;
  layerType?: LayerType;
  visible?: boolean;
  leafletObject: T;
}
