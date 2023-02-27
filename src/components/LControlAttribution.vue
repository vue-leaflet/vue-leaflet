<script lang="ts">
import type L from "leaflet";
import {
  defineComponent,
  inject,
  markRaw,
  nextTick,
  onMounted,
  ref,
} from "vue";

import {
  controlAttributionProps,
  setupControlAttribution,
} from "@src/functions/controlAttribution";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import { WINDOW_OR_GLOBAL, assertInject, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControlAttribution",
  props: controlAttributionProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Attribution>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlAttribution(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = useGlobalLeaflet
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
});
</script>
