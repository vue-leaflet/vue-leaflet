import type L from "leaflet";

export interface IControlDefinition<T extends L.Control = L.Control> {
  leafletObject: T;
}
