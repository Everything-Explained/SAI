export const queryTokens = [
    'how', 'has', 'what', 'when',
  'where', 'why',  'who', 'does',
    'can', 'are', 'tell',   'is',
     'do', 'did', 'will',
];


export const contextTokens = [
  'this',   'was',  'like',     'i',
    'of',  'much',  'have',   'and',
    'in',   'you',    'me',  'your',
  'from',    'we', 'about',  'know',
   'how',   'not',  'whom',    'us',
  'what',    'am',    'be',  'when',
  'them',    'to',   'has', 'there',
   'our', 'those',  'here',
];


export const optionalTokens = [
  'a',    'an',    'do',   'can', 'the',
  'are',  'does',  'it',   'is',
  'that', 'could', 'would',
];


export const contractionCorrections: [RegExp, string][] = [
  [/haven't/g, 'have not'],
  [/aren't/g,  'are not'],
  [/won't/g,   'will not'],
  [/mustn't/g, 'must not'],
  [/can't/g,   'can not'],
  [/cannot/g,  'can not'],
  [/n't/g,     ' not'],
  [/'ll/g,     ' will'],
  [/'s/g,      ' is']
];


export const matchInvalidChars = /[^a-zA-Z]/g;


export const hashSeed = 0xAE10;
