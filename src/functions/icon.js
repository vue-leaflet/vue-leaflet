export const props = {
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
