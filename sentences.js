// Sentences for word-order practice, written in ASL gloss.
//
// ASL has its own grammar. Gloss writes each sign as an English word in
// capitals. Some sentences can be ordered more than one way, so `answers`
// lists every order the app accepts.

export const SENTENCES = [
  // Unit 4: First conversations
  { id: 's-name', unit: 'u4', en: 'What is your name?', answers: [['YOUR', 'NAME', 'WHAT']], extra: ['MY', 'YOU'], face: 'q-wh',
    note: 'WH-question signs like WHAT usually come at the end. Lower your eyebrows while you ask.' },
  { id: 's-nice', unit: 'u4', en: 'Nice to meet you.', answers: [['NICE', 'MEET', 'YOU']], extra: ['ME', 'GOOD'],
    note: 'A classic first conversation line.' },
  { id: 's-how', unit: 'u4', en: 'How are you?', answers: [['HOW', 'YOU']], extra: ['WHAT', 'ME'], face: 'q-wh',
    note: 'ASL leaves out small words like "are."' },
  { id: 's-fine', unit: 'u4', en: "I'm fine.", answers: [['ME', 'FINE'], ['FINE', 'ME']], extra: ['YOU', 'GOOD'],
    note: 'Both orders are common.' },

  // Unit 5: Family and friends
  { id: 's-family', unit: 'u5', en: 'I love my family.', answers: [['ME', 'LOVE', 'MY', 'FAMILY'], ['MY', 'FAMILY', 'ME', 'LOVE']], extra: ['YOUR', 'FRIEND'],
    note: 'You can also put the topic first: MY FAMILY, ME LOVE.' },
  { id: 's-mother', unit: 'u5', en: 'Nice to meet your mother.', answers: [['NICE', 'MEET', 'YOUR', 'MOTHER']], extra: ['FATHER', 'MY'],
    note: 'YOUR uses a flat palm facing the person.' },

  // Unit 6: Feelings
  { id: 's-happy', unit: 'u6', en: "I'm happy.", answers: [['ME', 'HAPPY'], ['HAPPY', 'ME']], extra: ['YOU', 'SAD'],
    note: 'Let your face show it too.' },
  { id: 's-tired', unit: 'u6', en: 'Are you tired?', answers: [['YOU', 'TIRED']], extra: ['ME', 'HAPPY'], face: 'q-yn',
    note: 'Yes/no questions raise the eyebrows.' },
  { id: 's-excited', unit: 'u6', en: 'Are you excited?', answers: [['YOU', 'EXCITED']], extra: ['ME', 'SCARED'], face: 'q-yn',
    note: 'Eyebrows up for a yes/no question.' },

  // Unit 7: Questions
  { id: 's-who', unit: 'u7', en: 'Who is your friend?', answers: [['YOUR', 'FRIEND', 'WHO']], extra: ['MY', 'WHERE'], face: 'q-wh',
    note: 'WHO goes at the end, with your eyebrows down.' },
  { id: 's-why', unit: 'u7', en: 'Why are you sad?', answers: [['YOU', 'SAD', 'WHY']], extra: ['WHO', 'HAPPY'], face: 'q-wh',
    note: 'Ask about the feeling first, then WHY.' },
  { id: 's-where-mom', unit: 'u7', en: 'Where is your mother?', answers: [['YOUR', 'MOTHER', 'WHERE']], extra: ['WHEN', 'MY'], face: 'q-wh',
    note: 'The person you are asking about comes first.' },

  // Unit 8: Everyday life
  { id: 's-bathroom', unit: 'u8', en: 'Where is the bathroom?', answers: [['BATHROOM', 'WHERE']], extra: ['HOME', 'WHAT'], face: 'q-wh',
    note: 'One of the most useful questions you can learn.' },
  { id: 's-eat', unit: 'u8', en: 'Did you eat already?', answers: [['YOU', 'EAT', 'FINISH']], extra: ['DRINK', 'MORE'], face: 'q-yn',
    note: 'FINISH after a verb means it already happened.' },
  { id: 's-water', unit: 'u8', en: 'Do you want water?', answers: [['YOU', 'WANT', 'WATER']], extra: ['NEED', 'ME'], face: 'q-yn',
    note: 'Raise your eyebrows to make it a question.' },
  { id: 's-work', unit: 'u8', en: 'Where do you work?', answers: [['YOU', 'WORK', 'WHERE']], extra: ['SCHOOL', 'WHO'], face: 'q-wh',
    note: 'WHERE comes last.' },
  { id: 's-help', unit: 'u8', en: 'I need help.', answers: [['ME', 'NEED', 'HELP']], extra: ['YOU', 'WANT'],
    note: 'Simple and clear.' },

  // Unit 9: Signing and Deaf culture
  { id: 's-deaf', unit: 'u9', en: 'Are you Deaf?', answers: [['YOU', 'DEAF']], extra: ['HEARING', 'ME'], face: 'q-yn',
    note: 'Eyebrows up. Many signers also point at the person again at the end: YOU DEAF YOU?' },
  { id: 's-learn', unit: 'u9', en: "I'm learning sign language.", answers: [['ME', 'LEARN', 'SIGN']], extra: ['YOU', 'UNDERSTAND'],
    note: 'SIGN can mean "sign language."' },
  { id: 's-understand', unit: 'u9', en: 'Do you understand?', answers: [['YOU', 'UNDERSTAND']], extra: ['ME', 'AGAIN'], face: 'q-yn',
    note: 'Eyebrows up.' },
  { id: 's-slow', unit: 'u9', en: 'Please sign slowly.', answers: [['PLEASE', 'SIGN', 'SLOW'], ['SIGN', 'SLOW', 'PLEASE']], extra: ['AGAIN', 'ME'],
    note: 'Both orders work. A polite request every learner needs.' },
  { id: 's-again', unit: 'u9', en: 'Can you repeat that?', answers: [['AGAIN', 'PLEASE'], ['PLEASE', 'AGAIN']], extra: ['SLOW', 'SIGN'],
    note: 'AGAIN, PLEASE is the friendly way to ask.' },
];

export const SENTENCE_BY_ID = Object.fromEntries(SENTENCES.map((s) => [s.id, s]));
