export class Constants {
  static queryTokens = [
      'how',  'has', 'what', 'when',
    'where',  'why',  'who', 'does',
      'can',  'are',   'is',   'do',
      'did', 'will',
  ];


  static contextTokens = [
    'this',   'was',  'like',     'i',
      'of',  'have',   'and',  'here',
      'in',   'you',    'me',  'your',
    'from',    'we', 'about',  'know',
    'how',   'not',  'whom',    'us',
    'what',    'am',    'be',  'when',
    'them',    'to',   'has', 'there',
    'our', 'those',
  ];


  static optionalTokens = [
    'a',    'an',    'do',   'can', 'the',
    'are',  'does',  'it',   'is',
    'that', 'could', 'would', 'did'
  ];


  static contractionMatrix: [RegExp, string][] = [
    [/won't/g        , 'will not'],
    [/can't|cannot/g , 'can not'],
    [/n't/g          , ' not'],
    [/'ll/g          , ' will'],
    [/it's/g         , 'it is'],
    [/'re/g          , ' are']
  ];


  static matchInvalidChars = /[^a-z]/g;
  static mockDir = './test/mocks';
}

