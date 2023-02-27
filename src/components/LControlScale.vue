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
  controlScaleProps,
  setupControlScale,
} from "@src/functions/controlScale";
import { propsBinder, WINDOW_OR_GLOBAL, assertInject } from "@src/utils.js";
import {
  RegisterControlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";

export default defineComponent({
  name: "LControlScale",
  props: controlScaleProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Scale>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlScale(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      leafletObject.value = markRaw<L.Control.Scale>(control.scale(options));
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
