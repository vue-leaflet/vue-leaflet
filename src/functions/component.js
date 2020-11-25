export const props = {
  options: {
    type: Object,
    default: () => ({}),
  },
};

export const optionsMerger = (options, props) => {
  return { ...options, ...props.options, options: undefined };
};
