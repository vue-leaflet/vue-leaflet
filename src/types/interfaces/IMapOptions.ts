import type L from "leaflet";

export interface IMapOptions extends L.MapOptions {
  beforeMapMount?: () => any;
}
