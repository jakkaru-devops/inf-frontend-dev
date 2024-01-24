declare interface String {
  isEmpty(): boolean;
  toCamelCase(): string;
  translitRusToLatin(): string;
}

declare interface Number {
  separateBy(delimiter: string): string;
  toHHMMSS(): string;
  padZero(len?: number): string;
  negativeOrZero(): number;
  positiveOrZero(): number;
  roundFraction(len?: number): number;
  gaussRound(len?: number): number;
  isInteger(): boolean;
}

declare interface Array {
  unique(): Array<string | number>;
  getRandomItem(): any;
}
