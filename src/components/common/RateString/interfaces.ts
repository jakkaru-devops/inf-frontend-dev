interface IStar {
  /**
   * Size
   */
  size?: number;
  /**
   * Color
   */
  color?: string;
  /**
   * Additional class
   */
  className?: string;
  /**
   * How many stars are filled
   */
  fill?: number;
  /**
   * Unfilled star color
   * the same as a `color` by default
   */
  emptyColor?: string;
}

interface IRateString {
  max?: number;
  rate: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  className?: string;
  onClick?: () => void;
}

export type { IRateString, IStar };
