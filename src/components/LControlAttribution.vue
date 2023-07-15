<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  controlAttributionProps,
  setupControlAttribution,
} from "@src/functions/controlAttribution";
import { RegisterControlInjection } from "@src/types/injectionKeys";
import { assertInject, getLeaflet, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControlAttribution",
  props: controlAttributionProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Attribution>();

    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlAttribution(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = await getLeaflet();

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
