<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import {
  controlScaleProps,
  setupControlScale,
} from "@src/functions/controlScale";
import { RegisterControlInjection } from "@src/types/injectionKeys";
import { assertInject, getLeaflet, propsBinder } from "@src/utils.js";

export default defineComponent({
  name: "LControlScale",
  props: controlScaleProps,
  setup(props, context) {
    const leafletObject = ref<L.Control.Scale>();

    const registerControl = assertInject(RegisterControlInjection);

    const { options, methods } = setupControlScale(props, leafletObject);

    onMounted(async () => {
      const { control }: typeof L = await getLeaflet();
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
