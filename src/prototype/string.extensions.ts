String.prototype.isEmpty = function (): boolean {
  if (!this) return true;
  if (typeof this !== 'string') return true;
  return this.trim().length === 0;
};

String.prototype.toCamelCase = function (): string {
  return this.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) =>
    chr.toUpperCase(),
  );
};

// eslint-disable-next-line no-extend-native
String.prototype.translitRusToLatin = function (): string {
  const ru: {
    [key: string]: string;
  } = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'j',
    з: 'z',
    и: 'i',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ы: 'y',
    э: 'e',
    ю: 'u',
    я: 'ya',
  };
  const n_str = [];

  const str = this.replace(/[ъь]+/g, '').replace(/й/g, 'i');

  for (let i = 0; i < str.length; ++i) {
    n_str.push(
      ru[str[i]] ||
        (ru[str[i].toLowerCase()] === undefined && str[i]) ||
        ru[str[i].toLowerCase()].replace(/^(.)/, match => match.toUpperCase()),
    );
  }

  return n_str.join('');
};

export default String;
