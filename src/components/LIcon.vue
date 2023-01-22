<script>
import { onMounted, ref, inject, nextTick, h } from "vue";
import {
  propsBinder,
  remapEvents,
  WINDOW_OR_GLOBAL,
  GLOBAL_LEAFLET_OPT,
  propsToLeafletOptions,
} from "../utils";
import { iconProps } from "../functions/icon";
import { componentProps, setupComponent } from "../functions/component";

/**
 * Icon component, lets you add and custom icons to the map
 */
export default {
  name: "LIcon",
  props: {
    ...iconProps,
    ...componentProps,
  },
  setup(props, context) {
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const canSetParentHtml = inject("canSetParentHtml");
    const setParentHtml = inject("setParentHtml");
    const setIcon = inject("setIcon");

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
      const options = propsToLeafletOptions(props, iconProps, componentOptions);
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
      const { DomEvent, divIcon: lDivIcon, icon: lIcon } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import("leaflet/dist/leaflet-src.esm");

      onDomEvent = DomEvent.on;
      offDomEvent = DomEvent.off;
      divIcon = lDivIcon;
      icon = lIcon;

      propsBinder(methods, {}, props);

      const observer = new MutationObserver(scheduleHtmlSwap);
      observer.observe(root.value, {
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
};
</script>
