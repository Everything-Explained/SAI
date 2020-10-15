export class Constants {
  static readonly queryTokens = [
      'how',  'has', 'what', 'when',
    'where',  'why',  'who', 'does',
      'can',  'are',   'is',   'do',
      'did', 'will',
  ];


  static readonly contextTokens = [
    'this',   'was',  'like',     'i',
      'of',  'have',   'and',  'here',
      'in',   'you',    'me',  'your',
    'from',    'we', 'about',  'know',
    'how',   'not',  'whom',    'us',
    'what',    'am',    'be',  'when',
    'them',    'to',   'has', 'there',
    'our', 'those',
  ];


  static readonly optionalTokens = [
    'a',    'an',    'do',   'can', 'the',
    'are',  'does',  'it',   'is',
    'that', 'could', 'would', 'did'
  ];


  static readonly contractionMatrix: [RegExp, string][] = [
    [/won't/g        , 'will not'],
    [/can't|cannot/g , 'can not'],
    [/n't/g          , ' not'],
    [/'ll/g          , ' will'],
    [/it's/g         , 'it is'],
    [/'re/g          , ' are']
  ];


  static readonly matchInvalidChars = /[^a-z]/g;
  static readonly mockDir = './test/mocks';
}

