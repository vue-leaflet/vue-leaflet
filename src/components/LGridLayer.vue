<script lang="ts">
import type L from "leaflet";
import {
  type PropType,
  defineComponent,
  h,
  inject,
  markRaw,
  nextTick,
  onMounted,
  ref,
} from "vue";

import {
  CreateVueGridLayer,
  type VueGridLayerTileRenderer,
  gridLayerProps,
  setupGridLayer,
} from "@src/functions/gridLayer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

export default defineComponent({
  name: "LGridLayer",
  props: {
    ...gridLayerProps,
    childRender: {
      type: Function as PropType<VueGridLayerTileRenderer>,
      required: true,
    },
  },
  setup(props, context) {
    const leafletObject = ref<L.GridLayer>();
    const root = ref(null);
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupGridLayer(props, leafletObject, context);

    onMounted(async () => {
      const { GridLayer, DomUtil, Util }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      const GLayer = CreateVueGridLayer(
        GridLayer,
        DomUtil,
        Util,
        props.childRender
      );
      leafletObject.value = markRaw<L.GridLayer>(new GLayer(options));

      const { listeners } = remapEvents(context.attrs);
      leafletObject.value.on(listeners);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { root, ready, leafletObject };
  },
  render() {
    if (this.ready) {
      return h("div", { style: { display: "none" }, ref: "root" });
    }
    return null;
  },
});
</script>
