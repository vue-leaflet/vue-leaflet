<script lang="ts">
import type L from "leaflet";
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import { controlZoomProps, setupControlZoom } from "@src/functions/controlZoom";
import { propsBinder, WINDOW_OR_GLOBAL, assertInject } from "@src/utils.js";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default {
  name: "LControlZoom",
  props: controlZoomProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Scale>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlZoom(props, leafletObject);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Control.Scale>(control.zoom(options));
      propsBinder(methods, leafletObject.value, props);
      registerControl({ leafletObject: leafletObject.value });
      nextTick(() => context.emit("ready", leafletObject.value));
    });

    return { leafletObject };
  },
  render() {
    return null;
  },
};
</script>
