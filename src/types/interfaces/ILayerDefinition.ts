import type L from "leaflet";

export interface ILayerDefinition<T extends L.Layer = L.Layer> {
  name?: string;
  layerType?: "base" | "overlay" | undefined;
  visible?: boolean;
  leafletObject: T;
}
