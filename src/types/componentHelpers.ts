import type { LooseRequired } from "@vue/shared";
import type L from "leaflet";
import type { ExtractPropTypes, Ref } from "vue";

import { LCircleMarkerProps } from "./../functions/circleMarker";

export type SetupProps<T> = Readonly<
  LooseRequired<Readonly<ExtractPropTypes<T>>>
>;

export type SetupFunction<TProps, TObject extends L.Class, TOptions> = (
  props?: SetupProps<TProps>,
  leafletObject?: Ref<TObject>,
  context?: any
) => { options: TOptions; methods: any };

type MyProps<T> =
  | (T extends number ? string : never)
  | (T extends string ? boolean : never);

function test<T>(foo: T, bar: MyProps<T>) {}

console.log(test("hi", true), test(12, "wut"), test(true, 7));

//
////////
//

export const LComponent = {
  LCircle: "LCircle",
  LCircleMarker: "LCircleMarker",
} as const;

type LComponentObjectMap = {
  [LComponent.LCircle]: Ref<L.Circle>;
  [LComponent.LCircleMarker]: Ref<L.CircleMarker>;
};

type LComponentOptionsMap = {
  [LComponent.LCircle]: L.CircleOptions;
  [LComponent.LCircleMarker]: L.CircleMarkerOptions;
};

type LComponentObject<T> = T extends keyof LComponentObjectMap
  ? LComponentObjectMap[T]
  : never;
type LComponentOptions<T> = T extends keyof LComponentOptionsMap
  ? LComponentOptionsMap[T]
  : never;

export type SetupFooTest<T extends keyof typeof LComponent> = (
  props: any,
  leafletObject?: LComponentObject<T>,
  context?: any
) => { options: LComponentOptions<T> };
