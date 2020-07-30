export const props = {
  pane: {
    type: String,
    default: 'tilePane'
  },
  opacity: {
    type: Number,
    custom: false,
    default: 1.0
  },
  zIndex: {
    type: Number,
    default: 1
  },
  tileSize: {
    type: Number,
    default: 256
  },
  noWrap: {
    type: Boolean,
    default: false
  }
};

export const setup = props => {
  const options = {
    pane: props.pane,
    opacity: props.opacity,
    zIndex: props.zIndex,
    tileSize: props.tileSize,
    noWrap: props.noWrap
  };
  return options;
};
