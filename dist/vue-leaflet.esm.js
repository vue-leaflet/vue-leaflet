import { watch, ref, provide, h, inject, onUnmounted, onBeforeUnmount, onMounted, nextTick, render as render$3, reactive, computed } from 'vue';

const debounce = (fn, time) => {
  let timeout;

  return function (...args) {
    const context = this;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn.apply(context, args);
      timeout = null;
    }, time);
  };
};

const capitalizeFirstLetter = (string) => {
  if (!string || typeof string.charAt !== "function") {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const isFunction = (x) => typeof x === "function";

const propsBinder = (methods, leafletElement, props) => {
  for (const key in props) {
    const setMethodName = "set" + capitalizeFirstLetter(key);
    if (methods[setMethodName]) {
      watch(
        () => props[key],
        (newVal, oldVal) => {
          methods[setMethodName](newVal, oldVal);
        }
      );
    } else if (leafletElement[setMethodName]) {
      watch(
        () => props[key],
        (newVal) => {
          leafletElement[setMethodName](newVal);
        }
      );
    }
  }
};

const remapEvents = (contextAttrs) => {
  const result = {};
  for (const attrName in contextAttrs) {
    if (
      attrName.startsWith("on") &&
      !attrName.startsWith("onUpdate") &&
      attrName !== "onReady"
    ) {
      const eventName = attrName.slice(2).toLocaleLowerCase();
      result[eventName] = contextAttrs[attrName];
    }
  }
  return result;
};

const resetWebpackIcon = async (Icon) => {
  const modules = await Promise.all([
    import('leaflet/dist/images/marker-icon-2x.png'),
    import('leaflet/dist/images/marker-icon.png'),
    import('leaflet/dist/images/marker-shadow.png'),
  ]);

  delete Icon.Default.prototype._getIconUrl;

  Icon.Default.mergeOptions({
    iconRetinaUrl: modules[0].default,
    iconUrl: modules[1].default,
    shadowUrl: modules[2].default,
  });
};

/**
 * Wraps a placeholder function and provides it with the given name.
 * The wrapper can later be updated with {@link updateLeafletWrapper}
 * to provide a different function.
 *
 * @param {String} methodName Key used to provide the wrapper function
 */
const provideLeafletWrapper = (methodName) => {
  const wrapped = ref(() =>
    console.warn(`Method ${methodName} has been invoked without being replaced`)
  );
  const wrapper = (...args) => wrapped.value(...args);
  // eslint-disable-next-line vue/no-ref-as-operand
  wrapper.wrapped = wrapped;
  provide(methodName, wrapper);

  return wrapper;
};

/**
 * Change the function that will be executed when an injected Leaflet wrapper
 * is invoked.
 *
 * @param {*} wrapper Provided wrapper whose wrapped function is to be updated
 * @param {function} leafletMethod New method to be wrapped by the wrapper
 */
const updateLeafletWrapper = (wrapper, leafletMethod) =>
  (wrapper.wrapped.value = leafletMethod);

const WINDOW_OR_GLOBAL =
  (typeof self === "object" && self.self === self && self) ||
  (typeof global === "object" && global.global === global && global) ||
  undefined;

const GLOBAL_LEAFLET_OPT = "useGlobalLeaflet";

const props$p = {
  options: {
    type: Object,
    default: () => ({}),
  },
};

const setup$o = (props) => {
  return { options: props.options, methods: {} };
};

const props$o = {
  ...props$p,
  pane: {
    type: String,
    default: "overlayPane",
  },
  attribution: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    custom: true,
    default: undefined,
  },
  layerType: {
    type: String,
    custom: true,
    default: undefined,
  },
  visible: {
    type: Boolean,
    custom: true,
    default: true,
  },
};

const setup$n = (props, leafletRef, context) => {
  const addLayer = inject("addLayer");
  const removeLayer = inject("removeLayer");
  const {
    options: componentOptions,
    methods: componentMethods,
  } = setup$o(props);

  const options = {
    ...componentOptions,
    attribution: props.attribution,
    pane: props.pane,
  };

  const addThisLayer = () => addLayer({ leafletObject: leafletRef.value });
  const removeThisLayer = () =>
    removeLayer({ leafletObject: leafletRef.value });

  const methods = {
    ...componentMethods,
    setAttribution(val, old) {
      const attributionControl = this.$parent.leafletObject.attributionControl;
      attributionControl.removeAttribution(old).addAttribution(val);
    },
    setName() {
      removeThisLayer();
      if (props.visible) {
        addThisLayer();
      }
    },
    setLayerType() {
      removeThisLayer();
      if (props.visible) {
        addThisLayer();
      }
    },
    setVisible(isVisible) {
      if (leafletRef.value) {
        if (isVisible) {
          addThisLayer();
        } else {
          removeThisLayer();
        }
      }
    },
    bindPopup({ leafletObject }) {
      if (!leafletRef.value || !isFunction(leafletRef.value.bindPopup)) {
        console.warn(
          "Attempt to bind popup before bindPopup method available on layer."
        );

        return;
      }

      leafletRef.value.bindPopup(leafletObject);
    },
    bindTooltip({ leafletObject }) {
      if (!leafletRef.value || !isFunction(leafletRef.value.bindTooltip)) {
        console.warn(
          "Attempt to bind tooltip before bindTooltip method available on layer."
        );

        return;
      }

      leafletRef.value.bindTooltip(leafletObject);
    },
    unbindTooltip() {
      const tooltip =
        leafletRef.value && isFunction(leafletRef.value.getTooltip)
          ? leafletRef.value.getTooltip()
          : null;
      if (tooltip && isFunction(tooltip.unbindTooltip)) {
        tooltip.unbindTooltip();
      }
    },
    unbindPopup() {
      const popup =
        leafletRef.value && isFunction(leafletRef.value.getPopup)
          ? leafletRef.value.getPopup()
          : null;
      if (popup && isFunction(popup.unbindPopup)) {
        popup.unbindPopup();
      }
    },
    updateVisibleProp(value) {
      /**
       * Triggers when the visible prop needs to be updated
       * @type {boolean}
       * @property {boolean} value - value of the visible property
       */
      context.emit("update:visible", value);
    },
  };

  provide("bindPopup", methods.bindPopup);
  provide("bindTooltip", methods.bindTooltip);
  provide("unbindTooltip", methods.unbindTooltip);
  provide("unbindPopup", methods.unbindPopup);

  onUnmounted(() => {
    methods.unbindPopup();
    methods.unbindTooltip();
    removeThisLayer();
  });

  return { options, methods };
};

const render$2 = (ready, slots) => {
  if (ready && slots.default) {
    return h("div", { style: { display: "none" } }, slots.default());
  }
};

const props$n = {
  ...props$p,
  interactive: {
    type: Boolean,
    default: true,
  },
  bubblingMouseEvents: {
    type: Boolean,
    default: true,
  },
};

const setup$m = (props) => {
  const { options: componentOptions, methods } = setup$o(props);
  const options = {
    ...componentOptions,
    interactive: props.interactive,
    bubblingMouseEvents: props.bubblingMouseEvents,
  };

  return { options, methods };
};

const props$m = {
  ...props$o,
  ...props$n,
  stroke: {
    type: Boolean,
    custom: true,
    default: true,
  },
  color: {
    type: String,
    custom: true,
    default: "#3388ff",
  },
  weight: {
    type: Number,
    custom: true,
    default: 3,
  },
  opacity: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  lineCap: {
    type: String,
    custom: true,
    default: "round",
  },
  lineJoin: {
    type: String,
    custom: true,
    default: "round",
  },
  dashArray: {
    type: String,
    custom: true,
    default: null,
  },
  dashOffset: {
    type: String,
    custom: true,
    default: null,
  },
  fill: {
    type: Boolean,
    custom: true,
    default: false,
  },
  fillColor: {
    type: String,
    custom: true,
    default: "#3388ff",
  },
  fillOpacity: {
    type: Number,
    custom: true,
    default: 0.2,
  },
  fillRule: {
    type: String,
    custom: true,
    default: "evenodd",
  },
  className: {
    type: String,
    custom: true,
    default: null,
  },
};

const setup$l = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setup$n(
    props,
    leafletRef,
    context
  );
  const {
    options: interactiveLayerOptions,
    methods: interactiveLayerMethods,
  } = setup$m(props);

  const removeLayer = inject("removeLayer");

  const options = {
    ...layerOptions,
    ...interactiveLayerOptions,
    stroke: props.stroke,
    color: props.color,
    weight: props.weight,
    opacity: props.opacity,
    lineCap: props.lineCap,
    lineJoin: props.lineJoin,
    dashArray: props.dashArray,
    dashOffset: props.dashOffset,
    fill: props.fill,
    fillColor: props.fillColor,
    fillOpacity: props.fillOpacity,
    fillRule: props.fillRule,
    className: props.className,
  };
  const methods = {
    ...layerMethods,
    ...interactiveLayerMethods,
    setStroke(stroke) {
      leafletRef.value.setStyle({ stroke });
    },
    setColor(color) {
      leafletRef.value.setStyle({ color });
    },
    setWeight(weight) {
      leafletRef.value.setStyle({ weight });
    },
    setOpacity(opacity) {
      leafletRef.value.setStyle({ opacity });
    },
    setLineCap(lineCap) {
      leafletRef.value.setStyle({ lineCap });
    },
    setLineJoin(lineJoin) {
      leafletRef.value.setStyle({ lineJoin });
    },
    setDashArray(dashArray) {
      leafletRef.value.setStyle({ dashArray });
    },
    setDashOffset(dashOffset) {
      leafletRef.value.setStyle({ dashOffset });
    },
    setFill(fill) {
      leafletRef.value.setStyle({ fill });
    },
    setFillColor(fillColor) {
      leafletRef.value.setStyle({ fillColor });
    },
    setFillOpacity(fillOpacity) {
      leafletRef.value.setStyle({ fillOpacity });
    },
    setFillRule(fillRule) {
      leafletRef.value.setStyle({ fillRule });
    },
    setClassName(className) {
      leafletRef.value.setStyle({ className });
    },
  };

  onBeforeUnmount(() => {
    removeLayer({ leafletObject: leafletRef.value });
  });

  return { options, methods };
};

const props$l = {
  ...props$m,
  latLng: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  /**
   * Radius of the marker in pixels.
   */
  radius: {
    type: Number,
    default: null,
  },
};

const setup$k = (props, leafletRef, context) => {
  const { options: pathOptions, methods: pathMethods } = setup$l(
    props,
    leafletRef,
    context
  );
  const options = {
    ...pathOptions,
    ...props,
  };
  const methods = {
    ...pathMethods,
    setRadius(radius) {
      leafletRef.value.setRadius(radius);
    },
    setLatLng(latLng) {
      leafletRef.value.setLatLng(latLng);
    },
  };

  return { options, methods };
};

const props$k = {
  ...props$l,
  /**
   * Radius of the circle in meters.
   */
  radius: {
    type: Number,
    default: null,
  },
};

const setup$j = (props, leafletRef, context) => {
  const {
    options: circleMarkerOptions,
    methods: circleMarkerMethods,
  } = setup$k(props, leafletRef, context);

  const options = {
    ...circleMarkerOptions,
    ...props,
  };

  const methods = {
    ...circleMarkerMethods,
  };

  return { options, methods };
};

/**
 * Circle component, lets you add and personalize circles on the map
 */
var script$l = {
  name: "LCircle",
  props: props$k,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$j(props, leafletRef, context);

    onMounted(async () => {
      const { circle, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = circle(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$l.__file = "src/components/LCircle.vue";

/**
 * Circle Marker component, lets you add and personalize circle markers on the map
 */
var script$k = {
  name: "LCircleMarker",
  props: props$l,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$k(props, leafletRef, context);

    onMounted(async () => {
      const { circleMarker, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = circleMarker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$k.__file = "src/components/LCircleMarker.vue";

const props$j = {
  ...props$p,
  position: {
    type: String,
    default: "topright",
  },
};

const setup$i = (props, leafletRef) => {
  const {
    options: componentOptions,
    methods: componentMethods,
  } = setup$o(props);
  const options = {
    ...componentOptions,
    position: props.position,
  };

  const methods = {
    ...componentMethods,
    setPosition(position) {
      if (leafletRef.value) {
        leafletRef.value.setPosition(position);
      }
    },
  };

  onUnmounted(() => {
    if (leafletRef.value) {
      leafletRef.value.remove();
    }
  });

  return { options, methods };
};

const render$1 = (slots) => {
  if (slots.default) {
    return h("div", { ref: "root" }, slots.default());
  }
  return null;
};

var script$j = {
  name: "LControl",
  props: {
    ...props$j,
    disableClickPropagation: {
      type: Boolean,
      custom: true,
      default: true,
    },
    disableScrollPropagation: {
      type: Boolean,
      custom: true,
      default: false,
    },
  },
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setup$i(props, leafletRef);

    onMounted(async () => {
      const { Control, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      const LControl = Control.extend({
        onAdd() {
          return root.value;
        },
      });

      leafletRef.value = new LControl(options);
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });

      if (props.disableClickPropagation) {
        DomEvent.disableClickPropagation(root.value);
      }
      if (props.disableScrollPropagation) {
        DomEvent.disableScrollPropagation(root.value);
      }
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { root, leafletObject: leafletRef };
  },
  render() {
    return render$1(this.$slots);
  },
};

script$j.__file = "src/components/LControl.vue";

const props$i = {
  ...props$j,
  prefix: {
    type: String,
    default: "Vue-Leaflet",
    custom: true,
  },
};

const setup$h = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setup$i(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    prefix: props.prefix,
  };

  const methods = {
    ...controlMethods,
    setPrefix(prefix) {
      leafletRef.value.setPrefix(prefix);
    },
  };

  return { options, methods };
};

var script$i = {
  name: "LControlAttribution",
  props: props$i,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setup$h(props, leafletRef);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = control.attribution(options);
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};

script$i.__file = "src/components/LControlAttribution.vue";

const props$h = {
  ...props$j,
  collapsed: {
    type: Boolean,
    default: true,
  },
  autoZIndex: {
    type: Boolean,
    default: true,
  },
  hideSingleBase: {
    type: Boolean,
    default: false,
  },
  sortLayers: {
    type: Boolean,
    default: false,
  },
  sortFunction: {
    type: Function,
    default: undefined,
  },
};

const setup$g = (props, leafletRef) => {
  const { options: controlOptions } = setup$i(props, leafletRef);
  const options = {
    ...controlOptions,
    collapsed: props.collapsed,
    autoZIndex: props.autoZIndex,
    hideSingleBase: props.hideSingleBase,
    sortLayers: props.sortLayers,
    sortFunction: props.sortFunction,
  };

  const methods = {
    addLayer(layer) {
      if (layer.layerType === "base") {
        leafletRef.value.addBaseLayer(layer.leafletObject, layer.name);
      } else if (layer.layerType === "overlay") {
        leafletRef.value.addOverlay(layer.leafletObject, layer.name);
      }
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };
  return { options, methods };
};

var script$h = {
  name: "LControlLayers",
  props: props$h,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerLayerControl = inject("registerLayerControl");

    const { options, methods } = setup$g(props, leafletRef);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = control.layers(null, null, options);

      propsBinder(methods, leafletRef.value, props);

      registerLayerControl({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};

script$h.__file = "src/components/LControlLayers.vue";

const props$g = {
  ...props$j,
  maxWidth: {
    type: Number,
    default: 100,
  },
  metric: {
    type: Boolean,
    default: true,
  },
  imperial: {
    type: Boolean,
    default: true,
  },
  updateWhenIdle: {
    type: Boolean,
    default: false,
  },
};

const setup$f = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setup$i(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    maxWidth: props.maxWidth,
    metric: props.metric,
    imperial: props.imperial,
    updateWhenIdle: props.updateWhenIdle,
  };

  return { options, methods: controlMethods };
};

var script$g = {
  name: "LControlScale",
  props: props$g,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setup$f(props, leafletRef);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = control.scale(options);
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};

script$g.__file = "src/components/LControlScale.vue";

const props$f = {
  ...props$j,
  zoomInText: {
    type: String,
    default: "+",
  },
  zoomInTitle: {
    type: String,
    default: "Zoom in",
  },
  zoomOutText: {
    type: String,
    default: "-",
  },
  zoomOutTitle: {
    type: String,
    default: "Zoom out",
  },
};

const setup$e = (props, leafletRef) => {
  const { options: controlOptions, methods: controlMethods } = setup$i(
    props,
    leafletRef
  );
  const options = {
    ...controlOptions,
    zoomInText: props.zoomInText,
    zoomInTitle: props.zoomInTitle,
    zoomOutText: props.zoomOutText,
    zoomOutTitle: props.zoomOutTitle,
  };

  return { options, methods: controlMethods };
};

var script$f = {
  name: "LControlZoom",
  props: props$f,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const registerControl = inject("registerControl");

    const { options, methods } = setup$e(props, leafletRef);

    onMounted(async () => {
      const { control } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = control.zoom(options);
      propsBinder(methods, leafletRef.value, props);
      registerControl({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};

script$f.__file = "src/components/LControlZoom.vue";

const props$e = {
  ...props$o,
};

const setup$d = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setup$n(
    props,
    leafletRef,
    context
  );

  const options = {
    ...layerOptions,
  };

  const methods = {
    ...layerMethods,
    addLayer(layer) {
      leafletRef.value.addLayer(layer.leafletObject);
    },
    removeLayer(layer) {
      leafletRef.value.removeLayer(layer.leafletObject);
    },
  };

  provide("addLayer", methods.addLayer);
  provide("removeLayer", methods.removeLayer);

  return { options, methods };
};

const props$d = {
  ...props$e,
};

const setup$c = (props, leafletRef) => {
  const { options: layerOptions, methods: layerGroupMethods } = setup$d(
    props,
    leafletRef
  );

  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerGroupMethods,
  };

  return { options, methods };
};

var script$e = {
  props: props$d,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { methods, options } = setup$c(props, leafletRef);

    onMounted(async () => {
      const { featureGroup, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = featureGroup(options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$e.__file = "src/components/LFeatureGroup.vue";

const props$c = {
  ...props$e,
  geojson: {
    type: [Object, Array],
    default: () => ({}),
  },
};

const setup$b = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerGroupMethods } = setup$d(
    props,
    leafletRef,
    context
  );

  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerGroupMethods,
    setGeojson(newVal) {
      leafletRef.value.clearLayers();
      leafletRef.value.addData(newVal);
    },
    getGeoJSONData() {
      return leafletRef.value.toGeoJSON();
    },
    getBounds() {
      return leafletRef.value.getBounds();
    },
  };

  return { options, methods };
};

var script$d = {
  props: props$c,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { methods, options } = setup$b(props, leafletRef, context);

    onMounted(async () => {
      const { geoJSON, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = geoJSON(props.geojson, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$d.__file = "src/components/LGeoJson.vue";

const props$b = {
  ...props$o,
  pane: {
    type: String,
    default: "tilePane",
  },
  opacity: {
    type: Number,
    custom: false,
    default: 1.0,
  },
  zIndex: {
    type: Number,
    default: 1,
  },
  tileSize: {
    type: Number,
    default: 256,
  },
  noWrap: {
    type: Boolean,
    default: false,
  },
  minZoom: {
    type: Number,
    default: 0,
  },
  maxZoom: {
    type: Number,
    default: undefined,
  },
};

const setup$a = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setup$n(
    props,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    pane: props.pane,
    opacity: props.opacity,
    zIndex: props.zIndex,
    tileSize: props.tileSize,
    noWrap: props.noWrap,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom,
  };
  return { options, methods: { ...layerMethods } };
};

var script$c = {
  props: {
    ...props$b,
    childRender: {
      type: Function,
      required: true,
    },
  },
  setup(props, context) {
    const leafletRef = ref({});
    const tileComponents = ref({});
    const root = ref(null);
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$a(props, leafletRef, context);

    onMounted(async () => {
      const { GridLayer, DomEvent, DomUtil } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      methods.onUnload = (e) => {
        const key = leafletRef.value._tileCoordsToKey(e.coords);
        if (tileComponents[key]) {
          tileComponents[key].innerHTML = "";
          tileComponents[key] = undefined;
        }
      };

      methods.setTileComponent = () => {
        leafletRef.value.redraw();
      };

      const GLayer = GridLayer.extend({
        createTile(coords) {
          const key = leafletRef.value._tileCoordsToKey(coords);
          tileComponents[key] = DomUtil.create("div");

          let vNode = h(
            { setup: props.childRender, props: ["coords"] },
            { coords }
          );
          render$3(vNode, tileComponents[key]);

          return tileComponents[key];
        },
      });

      leafletRef.value = new GLayer(options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("tileunload", methods.onUnload);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    onUnmounted(() => {
      leafletRef.value.off("tileunload", methods.unLoad);
    });

    return { root, ready, leafletObject: leafletRef };
  },
  render() {
    if (this.ready) {
      return h("div", { style: { display: "none" }, ref: "root" });
    }
    return null;
  },
};

script$c.__file = "src/components/LGridLayer.vue";

const props$a = {
  iconUrl: {
    type: String,
    custom: true,
    default: null,
  },
  iconRetinaUrl: {
    type: String,
    custom: true,
    default: null,
  },
  iconSize: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  iconAnchor: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  popupAnchor: {
    type: [Object, Array],
    custom: true,
    default: () => [0, 0],
  },
  tooltipAnchor: {
    type: [Object, Array],
    custom: true,
    default: () => [0, 0],
  },
  shadowUrl: {
    type: String,
    custom: true,
    default: null,
  },
  shadowRetinaUrl: {
    type: String,
    custom: true,
    default: null,
  },
  shadowSize: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  shadowAnchor: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  bgPos: {
    type: [Object, Array],
    custom: true,
    default: () => [0, 0],
  },
  className: {
    type: String,
    custom: true,
    default: "",
  },
  options: {
    type: Object,
    custom: true,
    default: () => ({}),
  },
};

/**
 * Icon component, lets you add and custom icons to the map
 */
var script$b = {
  name: "LIcon",
  props: {
    ...props$a,
    ...props$p,
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

      const { options: componentOptions } = setup$o(props);
      const options = {
        ...componentOptions,
        iconUrl: props.iconUrl,
        iconRetinaUrl: props.iconRetinaUrl,
        iconSize: props.iconSize,
        iconAnchor: props.iconAnchor,
        popupAnchor: props.popupAnchor,
        tooltipAnchor: props.tooltipAnchor,
        shadowUrl: props.shadowUrl,
        shadowRetinaUrl: props.shadowRetinaUrl,
        shadowSize: props.shadowSize,
        shadowAnchor: props.shadowAnchor,
        bgPos: props.bgPos,
        className: props.className,
        html: elHtml || props.html,
      };

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
        : await import('leaflet/dist/leaflet-src.esm');

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

script$b.__file = "src/components/LIcon.vue";

/**
 * @typedef {import('leaflet/dist/leaflet-src.esm.js').LatLngBounds} LatLngBounds
 */

const props$9 = {
  ...props$o,
  url: {
    type: String,
    required: true,
  },
  bounds: {
    type: [Array, Object],
    required: true,
  },
  opacity: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  alt: {
    type: String,
    default: "",
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  crossOrigin: {
    type: Boolean,
    default: false,
  },
  errorOverlayUrl: {
    type: String,
    custom: true,
    default: "",
  },
  zIndex: {
    type: Number,
    custom: true,
    default: 1,
  },
  className: {
    type: String,
    default: "",
  },
};

const setup$9 = (setupProps, LeafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setup$n(
    setupProps,
    LeafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...setupProps,
  };

  const methods = {
    ...layerMethods,
    /**
     * Sets the opacity of the overlay.
     * @param {number} opacity
     */
    setOpacity(opacity) {
      return LeafletRef.value.setOpacity(opacity);
    },
    /**
     * Changes the URL of the image.
     * @param {string} url
     */
    setUrl(url) {
      return LeafletRef.value.setUrl(url);
    },
    /**
     * Update the bounds that this ImageOverlay covers
     * @param {LatLngBounds | Array<Array<number>>} bounds
     */
    setBounds(bounds) {
      return LeafletRef.value.setBounds(bounds);
    },
    /**
     * Get the bounds that this ImageOverlay covers
     * @returns {LatLngBounds}
     */
    getBounds() {
      return LeafletRef.value.getBounds();
    },
    /**
     * Returns the instance of HTMLImageElement used by this overlay.
     * @returns {HTMLElement}
     */
    getElement() {
      return LeafletRef.value.getElement();
    },
    /**
     * Brings the layer to the top of all overlays.
     */
    bringToFront() {
      return LeafletRef.value.bringToFront();
    },
    /**
     * Brings the layer to the bottom of all overlays.
     */
    bringToBack() {
      return LeafletRef.value.bringToBack();
    },
    /**
     * Changes the zIndex of the image overlay.
     * @param {number} zIndex
     */
    setZIndex(zIndex) {
      return LeafletRef.value.setZIndex(zIndex);
    },
  };

  return { options, methods };
};

/**
 * ImageOverlay component, render a plain image instead of a geospatial map.
 */
var script$a = {
  name: "LImageOverlay",
  props: props$9,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$9(props, leafletRef, context);

    onMounted(async () => {
      const { imageOverlay, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');
      leafletRef.value = imageOverlay(props.url, props.bounds, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$a.__file = "src/components/LImageOverlay.vue";

var script$9 = {
  props: props$e,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { methods } = setup$d(props, leafletRef, context);

    onMounted(async () => {
      const { layerGroup, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');
      leafletRef.value = layerGroup(props.options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$9.__file = "src/components/LLayerGroup.vue";

var script$8 = {
  emits: ["ready", "update:zoom", "update:center", "update:bounds"],
  props: {
    ...props$p,
    /**
     * The center of the map, supports .sync modifier
     */
    center: {
      type: [Object, Array],
      default: () => [0, 0],
    },
    /**
     * The bounds of the map, supports .sync modifier
     */
    bounds: {
      type: [Array, Object],
      default: undefined,
    },
    /**
     * The max bounds of the map
     */
    maxBounds: {
      type: [Array, Object],
      default: undefined,
    },
    /**
     * The zoom of the map, supports .sync modifier
     */
    zoom: {
      type: Number,
      default: 0,
    },
    /**
     * The minZoom of the map
     */
    minZoom: {
      type: Number,
      default: undefined,
    },
    /**
     * The maxZoom of the map
     */
    maxZoom: {
      type: Number,
      default: undefined,
    },
    /**
     * The paddingBottomRight of the map
     */
    paddingBottomRight: {
      type: Array,
      default: undefined,
    },
    /**
     * The paddingTopLeft of the map
     */
    paddingTopLeft: {
      type: Array,
      default: undefined,
    },
    /**
     * The padding of the map
     */
    padding: {
      type: Array,
      default: undefined,
    },
    /**
     * The worldCopyJump option for the map
     */
    worldCopyJump: {
      type: Boolean,
      default: false,
    },
    /**
     * The CRS to use for the map. Can be an object that defines a coordinate reference
     * system for projecting geographical points into screen coordinates and back
     * (see https://leafletjs.com/reference-1.7.1.html#crs-l-crs-base), or a string
     * name identifying one of Leaflet's defined CRSs, such as "EPSG4326".
     */
    crs: {
      type: [String, Object],
      default: "EPSG3857",
    },
    maxBoundsViscosity: {
      type: Number,
      default: undefined,
    },
    inertia: {
      type: Boolean,
      default: undefined,
    },
    inertiaDeceleration: {
      type: Number,
      default: undefined,
    },
    inertiaMaxSpeed: {
      type: Number,
      default: undefined,
    },
    easeLinearity: {
      type: Number,
      default: undefined,
    },
    zoomAnimation: {
      type: Boolean,
      default: undefined,
    },
    zoomAnimationThreshold: {
      type: Number,
      default: undefined,
    },
    fadeAnimation: {
      type: Boolean,
      default: undefined,
    },
    markerZoomAnimation: {
      type: Boolean,
      default: undefined,
    },
    noBlockingAnimations: {
      type: Boolean,
      default: false,
    },
    useGlobalLeaflet: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, context) {
    const root = ref(null);
    const blueprint = reactive({
      ready: false,
      leafletRef: {},
      layersToAdd: [],
      layersInControl: [],
    });
    const { options: componentOptions } = setup$o(props);
    const options = {
      ...componentOptions,
      minZoom: props.minZoom,
      maxZoom: props.maxZoom,
      maxBounds: props.maxBounds,
      maxBoundsViscosity: props.maxBoundsViscosity,
      worldCopyJump: props.worldCopyJump,
      crs: props.crs,
      center: props.center,
      zoom: props.zoom,
      inertia: props.inertia,
      inertiaDeceleration: props.inertiaDeceleration,
      inertiaMaxSpeed: props.inertiaMaxSpeed,
      easeLinearity: props.easeLinearity,
      zoomAnimation: props.zoomAnimation,
      zoomAnimationThreshold: props.zoomAnimationThreshold,
      fadeAnimation: props.fadeAnimation,
      markerZoomAnimation: props.markerZoomAnimation,
    };

    const addLayer = provideLeafletWrapper("addLayer");
    const removeLayer = provideLeafletWrapper("removeLayer");
    const registerControl = provideLeafletWrapper("registerControl");
    const registerLayerControl = provideLeafletWrapper("registerLayerControl");
    provide(GLOBAL_LEAFLET_OPT, props.useGlobalLeaflet);

    const eventHandlers = {
      moveEndHandler() {
        /**
         * Triggers when zoom is updated
         * @type {number,string}
         */
        context.emit("update:zoom", blueprint.leafletRef.getZoom());
        /**
         * Triggers when center is updated
         * @type {object,array}
         */
        context.emit("update:center", blueprint.leafletRef.getCenter());

        /**
         * Triggers when bounds are updated
         * @type {object}
         */
        context.emit("update:bounds", blueprint.leafletRef.getBounds());
      },
      overlayAddHandler(e) {
        const layer = blueprint.layersInControl.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(true);
        }
      },
      overlayRemoveHandler(e) {
        const layer = blueprint.layersInControl.find((l) => l.name === e.name);
        if (layer) {
          layer.updateVisibleProp(false);
        }
      },
    };

    onMounted(async () => {
      if (props.useGlobalLeaflet) {
        WINDOW_OR_GLOBAL.L = WINDOW_OR_GLOBAL.L || (await import('leaflet'));
      }
      const {
        map,
        CRS,
        Icon,
        latLngBounds,
        latLng,
        DomEvent,
      } = props.useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      try {
        options.beforeMapMount && (await options.beforeMapMount());
      } catch (error) {
        console.error(
          `The following error occurred running the provided beforeMapMount hook ${error.message}`
        );
      }

      await resetWebpackIcon(Icon);

      const optionsCrs =
        typeof options.crs == "string" ? CRS[options.crs] : options.crs;
      options.crs = optionsCrs || CRS.EPSG3857;

      const methods = {
        addLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd.push(layer);
            } else {
              const exist = blueprint.layersInControl.find(
                (l) =>
                  l.leafletObject._leaflet_id ===
                  layer.leafletObject._leaflet_id
              );
              if (!exist) {
                blueprint.layerControl.addLayer(layer);
                blueprint.layersInControl.push(layer);
              }
            }
          }
          if (layer.visible !== false) {
            blueprint.leafletRef.addLayer(layer.leafletObject);
          }
        },
        removeLayer(layer) {
          if (layer.layerType !== undefined) {
            if (blueprint.layerControl === undefined) {
              blueprint.layersToAdd = blueprint.layersToAdd.filter(
                (l) => l.name !== layer.name
              );
            } else {
              blueprint.layerControl.removeLayer(layer.leafletObject);
              blueprint.layersInControl = blueprint.layersInControl.filter(
                (l) =>
                  l.leafletObject._leaflet_id !==
                  layer.leafletObject._leaflet_id
              );
            }
          }
          blueprint.leafletRef.removeLayer(layer.leafletObject);
        },

        registerLayerControl(lControlLayer) {
          blueprint.layerControl = lControlLayer;
          blueprint.layersToAdd.forEach((layer) => {
            blueprint.layerControl.addLayer(layer);
          });
          blueprint.layersToAdd = [];

          registerControl(lControlLayer);
        },

        registerControl(lControl) {
          blueprint.leafletRef.addControl(lControl.leafletObject);
        },

        setZoom(newVal) {
          const zoom = blueprint.leafletRef.getZoom();
          if (newVal !== zoom) {
            blueprint.leafletRef.setZoom(newVal, {
              animate: props.noBlockingAnimations ? false : null,
            });
          }
        },

        setPaddingBottomRight(newVal) {
          blueprint.paddingBottomRight = newVal;
        },
        setPaddingTopLeft(newVal) {
          blueprint.paddingTopLeft = newVal;
        },
        setPadding(newVal) {
          blueprint.padding = newVal;
        },
        setCrs(newVal) {
          const prevBounds = blueprint.leafletRef.getBounds();
          blueprint.leafletRef.options.crs = newVal;
          blueprint.leafletRef.fitBounds(prevBounds, {
            animate: false,
            padding: [0, 0],
          });
        },
        fitBounds(bounds) {
          blueprint.leafletRef.fitBounds(bounds, {
            animate: this.noBlockingAnimations ? false : null,
          });
        },
        setBounds(newVal) {
          if (!newVal) {
            return;
          }
          const newBounds = latLngBounds(newVal);
          if (!newBounds.isValid()) {
            return;
          }
          const oldBounds =
            blueprint.lastSetBounds || blueprint.leafletRef.getBounds();
          const boundsChanged = !oldBounds.equals(newBounds, 0); // set maxMargin to 0 - check exact equals
          if (boundsChanged) {
            blueprint.lastSetBounds = newBounds;
            blueprint.leafletRef.fitBounds(newBounds, this.fitBoundsOptions);
          }
        },

        setCenter(newVal) {
          if (newVal == null) {
            return;
          }
          const newCenter = latLng(newVal);
          const oldCenter =
            blueprint.lastSetCenter || blueprint.leafletRef.getCenter();
          if (
            oldCenter.lat !== newCenter.lat ||
            oldCenter.lng !== newCenter.lng
          ) {
            blueprint.lastSetCenter = newCenter;
            blueprint.leafletRef.panTo(newCenter, {
              animate: this.noBlockingAnimations ? false : null,
            });
          }
        },
      };

      updateLeafletWrapper(addLayer, methods.addLayer);
      updateLeafletWrapper(removeLayer, methods.removeLayer);
      updateLeafletWrapper(registerControl, methods.registerControl);
      updateLeafletWrapper(registerLayerControl, methods.registerLayerControl);

      blueprint.leafletRef = map(root.value, options);

      propsBinder(methods, blueprint.leafletRef, props);
      const listeners = remapEvents(context.attrs);

      blueprint.leafletRef.on(
        "moveend",
        debounce(eventHandlers.moveEndHandler, 100)
      );
      blueprint.leafletRef.on("overlayadd", eventHandlers.overlayAddHandler);
      blueprint.leafletRef.on(
        "overlayremove",
        eventHandlers.overlayRemoveHandler
      );
      DomEvent.on(blueprint.leafletRef, listeners);
      blueprint.ready = true;
      nextTick(() => context.emit("ready", blueprint.leafletRef));
    });

    onBeforeUnmount(() => {
      if (blueprint.leafletRef) {
        blueprint.leafletRef.remove();
      }
    });

    const leafletObject = computed(() => blueprint.leafletRef);
    const ready = computed(() => blueprint.ready);
    return { root, ready, leafletObject };
  },
  render() {
    return h(
      "div",
      { style: { width: "100%", height: "100%" }, ref: "root" },
      this.ready ? this.$slots.default() : {}
    );
  },
};

script$8.__file = "src/components/LMap.vue";

const props$8 = {
  ...props$o,
  pane: {
    type: String,
    default: "markerPane",
  },
  draggable: {
    type: Boolean,
    custom: true,
    default: false,
  },
  latLng: {
    type: [Object, Array],
    custom: true,
    default: null,
  },
  icon: {
    type: [Object],
    default: () => undefined,
    custom: false,
  },
  zIndexOffset: {
    type: Number,
    custom: false,
    default: null,
  },
};

const setup$8 = (props, leafletRef, context) => {
  const { options: layerOptions, methods: layerMethods } = setup$n(
    props,
    leafletRef,
    context
  );
  const options = {
    ...layerOptions,
    ...props,
  };

  const methods = {
    ...layerMethods,
    setDraggable(value) {
      if (leafletRef.value.dragging) {
        value
          ? leafletRef.value.dragging.enable()
          : leafletRef.value.dragging.disable();
      }
    },
    latLngSync(event) {
      context.emit("update:latLng", event.latlng);
      context.emit("update:lat-lng", event.latlng);
    },
    setLatLng(newVal) {
      if (newVal == null) {
        return;
      }

      if (leafletRef.value) {
        const oldLatLng = leafletRef.value.getLatLng();
        if (!oldLatLng || !oldLatLng.equals(newVal)) {
          leafletRef.value.setLatLng(newVal);
        }
      }
    },
  };
  return { options, methods };
};

/**
 * Marker component, lets you add and personalize markers on the map
 */
var script$7 = {
  name: "LMarker",
  props: props$8,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    provide("canSetParentHtml", () => !!leafletRef.value.getElement());
    provide(
      "setParentHtml",
      (html) => (leafletRef.value.getElement().innerHTML = html)
    );
    provide(
      "setIcon",
      (newIcon) => leafletRef.value.setIcon && leafletRef.value.setIcon(newIcon)
    );
    const { options, methods } = setup$8(props, leafletRef, context);
    if (options.icon === undefined) {
      // If the options objection has a property named 'icon', then Leaflet will overwrite
      // the default icon with it for the marker, _even if it is undefined_.
      // This leads to the issue discussed in https://github.com/vue-leaflet/vue-leaflet/issues/130
      delete options.icon;
    }

    onMounted(async () => {
      const { marker, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');
      leafletRef.value = marker(props.latLng, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      leafletRef.value.on("move", debounce(methods.latLngSync, 100));
      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$7.__file = "src/components/LMarker.vue";

const props$7 = {
  ...props$m,
  latLngs: {
    type: Array,
    default: () => [],
  },
  smoothFactor: {
    type: Number,
    custom: true,
    default: 1.0,
  },
  noClip: {
    type: Boolean,
    custom: true,
    default: false,
  },
};

const setup$7 = (props, leafletRef, context) => {
  const { options: pathOptions, methods: pathMethods } = setup$l(
    props,
    leafletRef,
    context
  );
  const options = {
    ...pathOptions,
    ...props,
  };

  const methods = {
    ...pathMethods,
    setSmoothFactor(smoothFactor) {
      leafletRef.value.setStyle({ smoothFactor });
    },
    setNoClip(noClip) {
      leafletRef.value.setStyle({ noClip });
    },
    addLatLng(latLng) {
      leafletRef.value.addLatLng(latLng);
    },
  };
  return { options, methods };
};

const props$6 = {
  ...props$7,
};

const setup$6 = (props, leafletRef, context) => {
  const { options: polylineOptions, methods: polylineMethods } = setup$7(
    props,
    leafletRef,
    context
  );
  const options = {
    ...polylineOptions,
    ...props,
  };

  const methods = {
    ...polylineMethods,
    toGeoJSON(precision) {
      return leafletRef.value.toGeoJSON(precision);
    },
  };

  return { options, methods };
};

/**
 * Polygon component, lets you add and customize polygon regions on the map
 */
var script$6 = {
  name: "LPolygon",
  props: props$6,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$6(props, leafletRef, context);

    onMounted(async () => {
      const { polygon, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = polygon(props.latLngs, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$6.__file = "src/components/LPolygon.vue";

/**
 * Polyline component, lets you add and personalize polylines on the map
 */
var script$5 = {
  name: "LPolyline",
  props: props$7,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$7(props, leafletRef, context);

    onMounted(async () => {
      const { polyline, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = polyline(props.latLngs, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$5.__file = "src/components/LPolyline.vue";

const props$5 = {
  ...props$p,
  content: {
    type: String,
    default: null,
  },
};

const setup$5 = (props, leafletRef) => {
  const { options, methods: componentMethods } = setup$o(props);
  const methods = {
    ...componentMethods,
    setContent(newVal) {
      if (leafletRef.value && newVal !== null && newVal !== undefined) {
        leafletRef.value.setContent(newVal);
      }
    },
  };
  return { options, methods };
};

const render = (slots) => {
  if (slots.default) {
    return h("div", { ref: "root" }, slots.default());
  }
  return null;
};

const props$4 = {
  ...props$5,
  latLng: {
    type: [Object, Array],
    default: () => [],
  },
};

const setup$4 = (props, leafletRef) => {
  const { options, methods } = setup$5(props, leafletRef);
  const unbindPopup = inject("unbindPopup");

  onBeforeUnmount(() => {
    unbindPopup();
  });

  return { options, methods };
};

/**
 * Display a popup on the map
 */
var script$4 = {
  name: "LPopup",
  props: props$4,
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const bindPopup = inject("bindPopup");

    const { options, methods } = setup$4(props, leafletRef);

    onMounted(async () => {
      const { popup, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = popup(options);

      if (props.latLng !== undefined) {
        leafletRef.value.setLatLng(props.latLng);
      }

      propsBinder(methods, leafletRef.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      leafletRef.value.setContent(props.content || root.value);
      bindPopup({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { root, leafletObject: leafletRef };
  },
  render() {
    return render(this.$slots);
  },
};

script$4.__file = "src/components/LPopup.vue";

const props$3 = {
  ...props$6,
  bounds: {
    type: Array,
    default: undefined,
  },
};

const setup$3 = (props, leafletRef, context) => {
  const { options: polygonOptions, methods: polygonMethods } = setup$6(
    props,
    leafletRef,
    context
  );
  const options = {
    ...polygonOptions,
    ...props,
  };

  const methods = {
    ...polygonMethods,
    setBounds(latLngBounds) {
      leafletRef.value.setBounds(latLngBounds);
    },
    setLatLngs(latLngs) {
      // Calling setLatLngs on a Leaflet rectangle will convert it
      // to a polygon. So instead, we call setBounds here to ensure
      // that the rectangle remains a rectangle, defined by the
      // bounds of the points in the latLngs array.
      leafletRef.value.setBounds(latLngs);
    },
  };

  return { options, methods };
};

/**
 * Rectangle component, lets you add and customize rectangular regions on the map
 */
var script$3 = {
  name: "LRectangle",
  props: props$3,
  setup(props, context) {
    const leafletRef = ref({});
    const ready = ref(false);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$3(props, leafletRef, context);

    onMounted(async () => {
      const { rectangle, latLngBounds, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      const bounds =
        props.bounds && props.bounds.length
          ? latLngBounds(props.bounds)
          : latLngBounds(props.latLngs);
      leafletRef.value = rectangle(bounds, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);

      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      ready.value = true;
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { ready, leafletObject: leafletRef };
  },
  render() {
    return render$2(this.ready, this.$slots);
  },
};

script$3.__file = "src/components/LRectangle.vue";

const props$2 = {
  ...props$b,
  tms: {
    type: Boolean,
    default: false,
  },
  subdomains: {
    type: String,
    default: "abc",
  },
  detectRetina: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: null,
  },
};

const setup$2 = (props, leafletRef, context) => {
  const {
    options: gridLayerOptions,
    methods: gridLayerMethods,
  } = setup$a(props, leafletRef, context);
  const options = {
    ...gridLayerOptions,
    tms: props.tms,
    subdomains: props.subdomains,
    detectRetina: props.detectRetina,
  };
  return {
    options,
    methods: {
      ...gridLayerMethods,
    },
  };
};

var script$2 = {
  props: props$2,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup$2(props, leafletRef, context);

    onMounted(async () => {
      const { tileLayer, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');
      leafletRef.value = tileLayer(props.url, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });

    return { leafletObject: leafletRef };
  },
  render() {
    return null;
  },
};

script$2.__file = "src/components/LTileLayer.vue";

const props$1 = {
  ...props$5,
};

const setup$1 = (props, leafletRef) => {
  const { options, methods } = setup$5(props, leafletRef);
  const unbindTooltip = inject("unbindTooltip");

  onBeforeUnmount(() => {
    unbindTooltip();
  });

  return { options, methods };
};

/**
 * Display a tooltip on the map
 */
var script$1 = {
  name: "LTooltip",
  props: props$1,
  setup(props, context) {
    const leafletRef = ref({});
    const root = ref(null);

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const bindTooltip = inject("bindTooltip");

    const { options, methods } = setup$1(props, leafletRef);

    onMounted(async () => {
      const { tooltip, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = tooltip(options);

      propsBinder(methods, leafletRef.value, props);
      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);
      leafletRef.value.setContent(props.content || root.value);
      bindTooltip({ leafletObject: leafletRef.value });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { root, leafletObject: leafletRef };
  },
  render() {
    return render(this.$slots);
  },
};

script$1.__file = "src/components/LTooltip.vue";

const props = {
  ...props$2,
  baseUrl: {
    type: String,
    default: null,
    required: true,
  },
  layers: {
    type: String,
    default: "",
  },
  styles: {
    type: String,
    default: "",
  },
  format: {
    type: String,
    default: "image/jpeg",
  },
  transparent: {
    type: Boolean,
    custom: false,
  },
  version: {
    type: String,
    default: "1.1.1",
  },
  crs: {
    default: null,
  },
  upperCase: {
    type: Boolean,
    default: false,
  },
};

const setup = (props, leafletRef) => {
  const {
    options: tileLayerOptions,
    methods: tileLayerMethods,
  } = setup$2(props, leafletRef);
  const options = {
    ...tileLayerOptions,
    layers: props.layers,
    styles: props.styles,
    format: props.format,
    transparent: props.transparent,
    version: props.version,
    crs: props.crs,
    upperCase: props.upperCase,
  };
  return {
    options,
    methods: {
      ...tileLayerMethods,
    },
  };
};

var script = {
  props,
  setup(props, context) {
    const leafletRef = ref({});

    const useGlobalLeaflet = inject(GLOBAL_LEAFLET_OPT);
    const addLayer = inject("addLayer");

    const { options, methods } = setup(props, leafletRef);

    onMounted(async () => {
      const { tileLayer, DomEvent } = useGlobalLeaflet
        ? WINDOW_OR_GLOBAL.L
        : await import('leaflet/dist/leaflet-src.esm');

      leafletRef.value = tileLayer.wms(props.baseUrl, options);

      const listeners = remapEvents(context.attrs);
      DomEvent.on(leafletRef.value, listeners);

      propsBinder(methods, leafletRef.value, props);
      addLayer({
        ...props,
        ...methods,
        leafletObject: leafletRef.value,
      });
      nextTick(() => context.emit("ready", leafletRef.value));
    });
    return { leafletObject: leafletRef.value };
  },
  render() {
    return null;
  },
};

script.__file = "src/components/LWmsTileLayer.vue";

export { script$l as LCircle, script$k as LCircleMarker, script$j as LControl, script$i as LControlAttribution, script$h as LControlLayers, script$g as LControlScale, script$f as LControlZoom, script$e as LFeatureGroup, script$d as LGeoJson, script$c as LGridLayer, script$b as LIcon, script$a as LImageOverlay, script$9 as LLayerGroup, script$8 as LMap, script$7 as LMarker, script$6 as LPolygon, script$5 as LPolyline, script$4 as LPopup, script$3 as LRectangle, script$2 as LTileLayer, script$1 as LTooltip, script as LWmsTileLayer };
//# sourceMappingURL=vue-leaflet.esm.js.map
