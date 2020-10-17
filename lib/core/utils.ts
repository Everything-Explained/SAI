
export function padStr(str: string, amount: number, char: string) {
  while (amount--) { str = `${char}${str}`; }
  return str;
}


/**
 * Pads a number based on an expected magnitude.
 *
 * @param magnitude A number representing an order of 10. Setting
 *                  magnitude to **1** means you expect a magnitude of
 *                  numbers between **0** and **100**.
 */
export function padNumber(num: number, magnitude = 0) {
  const places = `${10 * Math.pow(10, magnitude)}`.length;
  const padAmount = places - num.toString().length;
  if (padAmount < 0)
    throw Error('Number is greater than specified magnitude.')
  ;
  return padStr(num.toString(), padAmount, '0');
}