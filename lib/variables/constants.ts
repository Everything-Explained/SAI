export const queryTokens = [
    'how',  'has', 'what', 'when',
  'where',  'why',  'who', 'does',
    'can',  'are',   'is',   'do',
    'did', 'will',
];


export const contextTokens = [
  'this',   'was',  'like',     'i',
    'of',  'have',   'and',  'here',
    'in',   'you',    'me',  'your',
  'from',    'we', 'about',  'know',
   'how',   'not',  'whom',    'us',
  'what',    'am',    'be',  'when',
  'them',    'to',   'has', 'there',
   'our', 'those',
];


export const optionalTokens = [
  'a',    'an',    'do',   'can', 'the',
  'are',  'does',  'it',   'is',
  'that', 'could', 'would', 'did'
];


export const contractionCorrections: [RegExp, string][] = [
  [/won't/g        , 'will not'],
  [/can't|cannot/g , 'can not'],
  [/n't/g          , ' not'],
  [/'ll/g          , ' will'],
  [/'s/g           , ' is'],
  [/'re/g          , ' are']
];


export const matchInvalidChars = /[^a-z]/g;
export const testDir = './test/mocks';
