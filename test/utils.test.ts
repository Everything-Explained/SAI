import tape from 'tape';
import { padNumber, padStr } from '../lib/core/utils';



tape('Utils', t => {

  t.test('padStr() returns the input string prepended with an amount of a character.', async t => {
    t.is(padStr('test', 1, '@'), '@test');
    t.is(padStr('test', 3, '@'), '@@@test');
  });

  t.test('padStr() returns the input string unmodified if amount is 0', async t => {
    t.is(padStr('test', 0, '@'), 'test');
  });

  t.test('padStr() throws an Error if amount is less than 0.', async t => {
    t.throws(() => padStr('test', -1, '@'));
  });

  t.test('padNumber() returns a number padded by Zeros', async t => {
    t.is(padNumber(5, 1), '005');
  });

  t.test('padNumber() throws an Error if magnitude less than Zero.', async t => {
    t.throws(() => padNumber(24, -1));
  });

  t.test('padNumber() with default magnitude, it pads numbers 0 through 9.', async t => {
    t.is(padNumber(9), '09');
    t.is(padNumber(11), '11');
  });

  t.test('padNumber() ignores padding if the number is below the magnitude.', async t => {
    t.is(padNumber(9, 1), '009');
    t.is(padNumber(99, 1), '099');
    t.is(padNumber(999, 1), '999');
    t.is(padNumber(1111, 1), '1111');
  });

});