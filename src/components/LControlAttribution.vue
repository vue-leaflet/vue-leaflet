<script lang="ts">
import type L from "leaflet";
import { onMounted, ref, inject, nextTick, markRaw } from "vue";
import {
  controlAttributionProps,
  setupControlAttribution,
} from "@src/functions/controlAttribution";
import { propsBinder, WINDOW_OR_GLOBAL, assertInject } from "@src/utils.js";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default {
  name: "LControlAttribution",
  props: controlAttributionProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Attribution>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlAttribution(props, leafletObject);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Control.Attribution>(
        control.attribution(options)
      );
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
