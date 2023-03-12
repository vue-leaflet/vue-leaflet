import type L from "leaflet";
import type { InjectionKey } from "vue";

import type { IControlDefinition, ILayerDefinition } from "./interfaces";

export const UseGlobalLeafletInjection = Symbol() as InjectionKey<boolean>;
export const AddLayerInjection = Symbol() as InjectionKey<
  (layer: ILayerDefinition) => void
>;
export const RemoveLayerInjection = Symbol() as InjectionKey<
  (layer: ILayerDefinition) => void
>;
export const RegisterControlInjection = Symbol() as InjectionKey<
  (control: IControlDefinition) => void
>;
export const RegisterLayerControlInjection = Symbol() as InjectionKey<
  (control: IControlDefinition<L.Control.Layers>) => void
>;

export const CanSetParentHtmlInjection = Symbol() as InjectionKey<
  () => boolean
>;
export const SetParentHtmlInjection = Symbol() as InjectionKey<
  (html: string) => void
>;
export const SetIconInjection = Symbol() as InjectionKey<
  (newIcon: L.DivIcon | L.Icon | undefined) => L.Marker<any> | undefined
>;

export const BindPopupInjection = Symbol() as InjectionKey<
  (leafletObject: L.Layer | undefined) => void
>;
export const BindTooltipInjection = Symbol() as InjectionKey<
  (leafletObject: L.Layer | undefined) => void
>;
export const UnbindPopupInjection = Symbol() as InjectionKey<() => void>;
export const UnbindTooltipInjection = Symbol() as InjectionKey<() => void>;
