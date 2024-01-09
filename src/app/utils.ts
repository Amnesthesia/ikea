import OpenAI from 'openai';

// Fetch an image from the given word
function getClient() {
  return new OpenAI({ dangerouslyAllowBrowser: true, apiKey: localStorage.getItem('openai-key') as string });
}

let lastGenerated: { data: ReturnType<ReturnType<typeof getClient>['images']['generate']> | null, timestamp: number } | null = null;

export async function generateImage(prompt: string) {
  if (lastGenerated?.data && lastGenerated.timestamp + 15000 > new Date().getTime()) return lastGenerated?.data;
  lastGenerated = {
    data: getClient().images.generate({
      user: 'api',
      prompt,
      response_format: 'b64_json',
      size: '1024x1024',
      quality: 'standard',
      model: 'dall-e-3'
    }),
    timestamp: new Date().getTime()
  };
  return lastGenerated.data;
}

export interface Word {
  type: string;
  english: {
    word: string;
    variations: string[];
  };
  swedish: {
    word: string;
    variations: string[];
  };
}

export function getPrompt(word: string, type?: string) {
  if (!word) return;
  if (!type) return `Vector illustration of a black shadow silhouette on white (#FFFFFF) background, symbolizing "${word}"`;
  if (type.trim() === 'noun') {
    return `Vector illustration of a black shadow silhouette of a ${word} on a white (#FFFFFF) background`
  }
  if (type.trim() === 'adjective') {
    return `Vector illustration of a black shadow silhouette of something ${word} on a white (#FFFFFF) background`
  }
  if (type.trim() === 'verb') {
    return `Vector illustration of a black shadow silhouette of a person ${word} on a white (#FFFFFF) background`
  }
}

export interface GetWordOpts {
  theme?: string | null;
  language?: string | null;
  word?: string | null;
}

export async function getWord(opts?: GetWordOpts): Promise<Word | null> {
  const { word: wordPreset, language, theme } = opts || { theme: undefined, language: 'swedish', word: undefined };

  const result = await getClient().completions.create({
    model: 'gpt-3.5-turbo-instruct',
    max_tokens: 250,
    frequency_penalty: 0.5,
    n: 1,
    temperature: 0.9,
    prompt: `
    You are learning ${language} ${theme ? `and want to learn words related to the theme "${theme}"` : `and want to learn a random word in ${language}`}. You want to learn 1 word at a time. You want to learn words in the following format:

    For nouns:
    { "type": "noun", "english": { "word": "table", "variations": ["a table", "the table"] }, "swedish": { "word": "bord", "variations": ["ett bord", "bordet"] } }

    For verbs:
    { "type": "verb", "english": { "word": "eat", "variations": ["eat", "ate", "eaten"] }, "swedish": { "word": "äta", "variations": ["äta", "åt", "ätit"] } }

    For adverbs:
    { "type": "adverb", "english": { "word": "quickly", "variations": ["quickly"] }, "swedish": { "word": "snabbt", "variations": ["snabbt"] } }

    For adjectives:
    { "type": "adjective", "english": { "word": "quick", "variations": ["quick"] }, "swedish": { "word": "snabb", "variations": ["snabb"] } }

    ${wordPreset ? `Translate and format the word "${wordPreset}" as JSON in the format above:` : `Pick 1 random word related to the theme "${theme}" in ${language}, and format it as JSON in the format above:`}
    `,
  });
  return result?.choices?.map((choice) => {
    try {
      return JSON.parse(choice.text) as Word;
    } catch {
      return null;
    }
  }).filter(Boolean)?.[0];
}