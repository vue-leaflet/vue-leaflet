import type L from "leaflet";

export interface ILayerDefinition<T extends L.Layer = L.Layer> {
  name?: string;
  layerType: "base" | "overlay" | undefined | string; // TODO: Remove `string` once tileLayer.js => tileLayer.ts
  visible: boolean;
  leafletObject: T;
}
