import type L from "leaflet";
import { type PropType, onUnmounted } from "vue";
import { type VNode, h, render } from "vue";

import { propsToLeafletOptions } from "@src/utils";

import { layerProps, setupLayer } from "./layer";

export type VueGridLayerTileRenderer = (props: {
  coords: L.Point;
}) => () => VNode;

export const gridLayerProps = {
  ...layerProps,
  opacity: {
    type: Number,
  },
  zIndex: {
    type: Number,
  },
  tileSize: {
    type: [Number, Array, Object] as PropType<Number | L.PointExpression>,
  },
  noWrap: {
    type: Boolean,
    default: undefined,
  },
  minZoom: {
    type: Number,
  },
  maxZoom: {
    type: Number,
  },
} as const;

export const setupGridLayer = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setupLayer(
    props,
    leafletRef,
    context
  );

  const options = propsToLeafletOptions<L.GridLayerOptions>(
    props,
    gridLayerProps,
    layerOptions
  );

  const methods = {
    ...layerMethods,
    setTileComponent() {
      leafletRef.value?.redraw();
    },
  };

  onUnmounted(() => {
    leafletRef.value.off();
  });

  return { options, methods };
};

export const CreateVueGridLayer = (
  GridLayer: typeof L.GridLayer,
  DomUtil: typeof L.DomUtil,
  Util: typeof L.Util,
  childRenderer: VueGridLayerTileRenderer
) =>
  GridLayer.extend({
    initialize(options: L.GridLayerOptions) {
      this.tileComponents = {};
      this.on("tileunload", this._unloadTile);
      Util.setOptions(this, options);
    },

    createTile(coords: L.Point): HTMLElement {
      const key = this._tileCoordsToKey(coords);
      this.tileComponents[key] = DomUtil.create("div");

      const vNode = h({ setup: childRenderer, props: ["coords"] }, { coords });
      render(vNode, this.tileComponents[key]);

      return this.tileComponents[key];
    },

    _unloadTile(e: L.TileEvent): void {
      const key = this._tileCoordsToKey(e.coords);
      if (this.tileComponents[key]) {
        this.tileComponents[key].innerHTML = "";
        this.tileComponents[key] = undefined;
      }
    },
  }) as (new (options: L.GridLayerOptions) => L.GridLayer) & typeof L.Class;
