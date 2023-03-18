import type L from "leaflet";
import type { InjectionKey } from "vue";

import type { IControlDefinition, ILayerDefinition } from "./interfaces";

export const UseGlobalLeafletInjection = Symbol(
  "useGlobalLeaflet"
) as InjectionKey<boolean>;

export const AddLayerInjection = Symbol("addLayer") as InjectionKey<
  (layer: ILayerDefinition) => void
>;

export const RemoveLayerInjection = Symbol("removeLayer") as InjectionKey<
  (layer: ILayerDefinition) => void
>;

export const RegisterControlInjection = Symbol(
  "registerControl"
) as InjectionKey<(control: IControlDefinition) => void>;

export const RegisterLayerControlInjection = Symbol(
  "registerLayerControl"
) as InjectionKey<(control: IControlDefinition<L.Control.Layers>) => void>;

export const CanSetParentHtmlInjection = Symbol(
  "canSetParentHtml"
) as InjectionKey<() => boolean>;

export const SetParentHtmlInjection = Symbol("setParentHtml") as InjectionKey<
  (html: string) => void
>;

export const SetIconInjection = Symbol("setIcon") as InjectionKey<
  (newIcon: L.DivIcon | L.Icon | undefined) => L.Marker<any> | undefined
>;

export const BindPopupInjection = Symbol("bindPopup") as InjectionKey<
  (leafletObject: L.Layer | undefined) => void
>;

export const BindTooltipInjection = Symbol("bindTooltip") as InjectionKey<
  (leafletObject: L.Layer | undefined) => void
>;

export const UnbindPopupInjection = Symbol("unbindPopup") as InjectionKey<
  () => void
>;

export const UnbindTooltipInjection = Symbol("unbindTooltip") as InjectionKey<
  () => void
>;
