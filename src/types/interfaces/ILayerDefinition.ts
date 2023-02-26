import type L from "leaflet";

export interface ILayerDefinition<T extends L.Layer> extends L.Layer {
  layerType: "base" | "overlay" | undefined;
  visible: boolean;
  leafletObject: T;
}
