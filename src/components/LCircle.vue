<script lang="ts">
import type L from "leaflet";
import { defineComponent, markRaw, nextTick, onMounted, ref } from "vue";

import { circleProps, setupCircle } from "@src/functions/circle";
import { render } from "@src/functions/layer";
import { AddLayerInjection } from "@src/types/injectionKeys";
import {
  assertInject,
  getLeaflet,
  propsBinder,
  remapEvents,
} from "@src/utils.js";

/**
 * Circle component, lets you add and personalize circles on the map
 */
export default defineComponent({
  name: "LCircle",
  props: circleProps,
  setup(props, context) {
    const leafletObject = ref<L.Circle>();
    const ready = ref(false);

    const addLayer = assertInject(AddLayerInjection);

    const { options, methods } = setupCircle(props, leafletObject, context);

    onMounted(async () => {
      const { circle }: typeof L = await getLeaflet();
      leafletObject.value = markRaw<L.Circle>(circle(props.latLng, options));

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

    return { ready, leafletObject };
  },
  render() {
    return render(this.ready, this.$slots);
  },
});
</script>
