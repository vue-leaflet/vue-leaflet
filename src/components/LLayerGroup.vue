<script lang="ts">
import type L from "leaflet";
import {
  onMounted,
  ref,
  inject,
  nextTick,
  markRaw,
  defineComponent,
} from "vue";
import {
  remapEvents,
  propsBinder,
  WINDOW_OR_GLOBAL,
  assertInject,
} from "@src/utils.js";
import { layerGroupProps, setupLayerGroup } from "@src/functions/layerGroup";
import { render } from "@src/functions/layer";
import {
  AddLayerInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default defineComponent({
  props: layerGroupProps,
  setup(props, context) {
    const leafletObject = ref<L.LayerGroup>();
    const ready = ref(false);

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const addLayer = assertInject(AddLayerInjection);

    const { methods } = setupLayerGroup(props, leafletObject, context);

    onMounted(async () => {
      const { layerGroup, DomEvent }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");
      leafletObject.value = markRaw<L.LayerGroup>(layerGroup(props.options));

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletObject.value, listeners);

      propsBinder(methods, leafletObject.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletObject.value));
    });
    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
