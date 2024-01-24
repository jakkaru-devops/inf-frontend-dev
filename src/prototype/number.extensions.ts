Number.prototype.separateBy = function (delimiter: string): string {
  return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, delimiter);
};

Number.prototype.toHHMMSS = function () {
  const secNum = parseInt(this.toString(), 10); // don't forget the second param
  let hours: number | string = Math.floor(secNum / 3600);
  let minutes: number | string = Math.floor((secNum - hours * 3600) / 60);
  let seconds: number | string = secNum - hours * 3600 - minutes * 60;
  let result = '';

  if (hours > 0) result += hours.padZero(2) + ':';
  if (minutes > 0) result += minutes.padZero(2) + ':';
  result += seconds.padZero(2);

  return result;
};

Number.prototype.padZero = function (len?: number) {
  len = len || 2;
  const zeros = new Array(len).join('0');
  return (zeros + this).slice(-len);
};

Number.prototype.negativeOrZero = function () {
  return this < 0 ? Number(this) : 0;
};

Number.prototype.positiveOrZero = function () {
  return this > 0 ? Number(this) : 0;
};

Number.prototype.roundFraction = function (len?: number) {
  if (typeof this !== 'number') return this;
  len = len || 2;
  if (this < 0.01) {
    len = this.toString().length - 2;
  }
  return this.gaussRound(len);
};

Number.prototype.gaussRound = function (len: number) {
  if (typeof this !== 'number') return this;
  let d = len || 0,
    m = Math.pow(10, d),
    n = +(d ? this * m : this).toFixed(8),
    i = Math.floor(n),
    f = n - i,
    e = 1e-8,
    r = f > 0.5 - e && f < 0.5 + e ? (i % 2 == 0 ? i : i + 1) : Math.round(n);

  return d ? r / m : r;
};

Number.prototype.isInteger = function () {
  return (
    typeof this === 'number' && isFinite(this) && Math.floor(this) === this
  );
};

export default Number;
