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
  controlLayersProps,
  setupControlLayers,
} from "@src/functions/controlLayers";
import { assertInject, propsBinder, WINDOW_OR_GLOBAL } from "@src/utils.js";
import {
  RegisterLayerControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default defineComponent({
  name: "LControlLayers",
  props: controlLayersProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Layers>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerLayerControl = assertInject(RegisterLayerControlInjection);

    const { options, methods } = setupControlLayers(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Control.Layers>(
        control.layers(null, null, options)
      );

      propsBinder(methods, leafletObject.value, props);

      registerLayerControl({
        ...props,
        ...methods,
        leafletObject: leafletObject.value,
      });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { leafletObject };
  },
  render() {
    return null;
  },
});
</script>
