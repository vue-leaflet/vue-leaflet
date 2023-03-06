<script lang="ts">
import type L from "leaflet";
import { defineComponent, h, inject, nextTick, onMounted, ref } from "vue";

import { componentProps, setupComponent } from "@src/functions/component";
import { iconProps } from "@src/functions/icon";
import {
  CanSetParentHtmlInjection,
  SetIconInjection,
  SetParentHtmlInjection,
  UseGlobalLeafletInjection,
} from "@src/types/injectionKeys";
import {
  WINDOW_OR_GLOBAL,
  assertInject,
  propsBinder,
  propsToLeafletOptions,
  remapEvents,
} from "@src/utils";

/**
 * Icon component, lets you add and custom icons to the map
 */
export default defineComponent({
  name: "LIcon",
  props: {
    ...iconProps,
    ...componentProps,
  },
  setup(props, context) {
    const root = ref<HTMLInputElement>();

    const useGlobalLeaflet = inject(UseGlobalLeafletInjection);
    const canSetParentHtml = assertInject(CanSetParentHtmlInjection);
    const setParentHtml = assertInject(SetParentHtmlInjection);
    const setIcon = assertInject(SetIconInjection);

    let onDomEvent;
    let offDomEvent;
    let divIcon;
    let icon;
    let iconObject = undefined;

    const createIcon = (el, recreationNeeded, htmlSwapNeeded) => {
      const elHtml = el && el.innerHTML;
      if (!recreationNeeded) {
        if (htmlSwapNeeded && iconObject && canSetParentHtml()) {
          setParentHtml(elHtml);
        }
        return;
      }

      const listeners = remapEvents(context.attrs);
      if (iconObject) {
        offDomEvent(iconObject, listeners);
      }

      const { options: componentOptions } = setupComponent(props);
      const options = propsToLeafletOptions<L.DivIconOptions>(
        props,
        iconProps,
        componentOptions
      );
      if (elHtml) {
        options.html = elHtml;
      }

      iconObject = options.html ? divIcon(options) : icon(options);
      onDomEvent(iconObject, listeners);
      setIcon(iconObject);
    };

    const scheduleCreateIcon = () => {
      nextTick(() => createIcon(root.value, true, false));
    };

    const scheduleHtmlSwap = () => {
      nextTick(() => createIcon(root.value, false, true));
    };

    const methods = {
      setIconUrl: scheduleCreateIcon,
      setIconRetinaUrl: scheduleCreateIcon,
      setIconSize: scheduleCreateIcon,
      setIconAnchor: scheduleCreateIcon,
      setPopupAnchor: scheduleCreateIcon,
      setTooltipAnchor: scheduleCreateIcon,
      setShadowUrl: scheduleCreateIcon,
      setShadowRetinaUrl: scheduleCreateIcon,
      setShadowAnchor: scheduleCreateIcon,
      setBgPos: scheduleCreateIcon,
      setClassName: scheduleCreateIcon,
      setHtml: scheduleCreateIcon,
    };

    onMounted(async () => {
      const {
        DomEvent,
        divIcon: lDivIcon,
        icon: lIcon,
      }: typeof L = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      onDomEvent = DomEvent.on;
      offDomEvent = DomEvent.off;
      divIcon = lDivIcon;
      icon = lIcon;

      propsBinder(methods, {}, props);

      const observer = new MutationObserver(scheduleHtmlSwap);
      observer.observe(root.value!, {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
      });
      scheduleCreateIcon();
    });

    return { root };
  },
  render() {
    const content = this.$slots.default ? this.$slots.default() : undefined;
    return h("div", { ref: "root" }, content);
  },
});
</script>
