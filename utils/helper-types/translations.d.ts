// Helpful when using translated rich text e.g. to use links
export type TextNode =
  | string
  | React.ReactNodeArray
  | React.ReactNode
  | React.ReactElement<any, string | React.JSXElementConstructor<any>>;
