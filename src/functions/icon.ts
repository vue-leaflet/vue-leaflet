import type L from "leaflet";
import type { PropType } from "vue";

export const iconProps = {
  iconUrl: {
    type: String,
  },
  iconRetinaUrl: {
    type: String,
  },
  iconSize: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  iconAnchor: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  popupAnchor: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  tooltipAnchor: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  shadowUrl: {
    type: String,
  },
  shadowRetinaUrl: {
    type: String,
  },
  shadowSize: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  shadowAnchor: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  bgPos: {
    type: [Object, Array] as PropType<L.PointExpression>,
  },
  className: {
    type: String,
  },
} as const;
