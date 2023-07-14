<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import { controlZoomProps, setupControlZoom } from "@src/functions/controlZoom";
import { RegisterControlInjection } from "@src/types/injectionKeys";
import { assertInject, getLeaflet, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControlZoom",
  props: controlZoomProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Scale>();

    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlZoom(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = await getLeaflet();

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
});
</script>
