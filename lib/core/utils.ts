
export function padStr(str: string, amount: number, char: string) {
  while (amount--) { str = `${char}${str}`; }
  return str;
}


/**
 * Pads a number based on an expected magnitude.
 *
 * @param magnitude The power of 10 you expect to pad a number to.
 * With a magnitude of: **1** it will only pad `0 through 99`.
 */
export function padNumber(num: number, magnitude = 0) {
  if (magnitude < 0)
    throw Error('Magnitude must be greater than 0')
  ;
  const places = `${10 * Math.pow(10, magnitude)}`.length;
  const padAmount = places - num.toString().length;
  if (padAmount < 0) return num.toString();
  return padStr(num.toString(), padAmount, '0');
}