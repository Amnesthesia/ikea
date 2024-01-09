import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetWordOpts, Word, generateImage, getPrompt, getWord } from './utils';

export function useURLParams() {
  return useMemo(() => new URLSearchParams(window.location.search || '{}'), []);
}
export function useWord(opts: GetWordOpts & { variations?: string[] }) {
  const [word, setWord] = useState<{ query: string; result: Word | null }>({ query: '', result: null });
  const [loading, setLoading] = useState(false);

  const fetchWord = useCallback(async (opts: GetWordOpts) => {
    try {
      setLoading(true);
      console.log({ opts });
      const result = await getWord(opts);
      console.debug({ result });
      setWord({ query: opts?.word || '', result });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (opts?.word === word?.query) return;
    if (!localStorage.getItem('openai-key')) return;
    console.log('Fetching word');
    fetchWord(opts);
  }, [fetchWord, loading, opts, word]);

  return [word?.result, loading] as const;
}

const CACHED_IMAGES: { [key: string]: string } = {};

export function useImage(imageUrl?: string, word?: string, type?: string) {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getGeneratedImage = useCallback(async (imagePrompt: string) => {
    setLoading(true);
    const result = await generateImage(imagePrompt);
    if (!result?.data?.[0]?.b64_json) return;
    setImage('data:image/png;base64,' + result.data[0].b64_json);
    setLoading(false);
  }, []);

  const getImageURL = useCallback(async (url: string) => {
    setLoading(true);
    if (CACHED_IMAGES[url]) {
      setImage((s) => (s !== CACHED_IMAGES[url] ? CACHED_IMAGES[url] : s) as string);
      setLoading(false);
      return;
    }
    const response = await fetch(imageUrl as string);
    const blob = await response.blob();
    const reader = new FileReader();
    reader.onload = () => {
      CACHED_IMAGES[url] = reader.result as string;
      setImage(reader.result as string);
    };
    reader.readAsDataURL(blob);
    setLoading(false);
  }, [imageUrl]);

  useEffect(() => {
    if (loading) return;
    if (!imageUrl) return;
    if (!localStorage.getItem('openai-key')) return;
    getImageURL(imageUrl as string);
  }, [getImageURL, loading, imageUrl]);


  useEffect(() => {
    if (loading) return;
    if (image) return;
    if (!word) return;
    if (!localStorage.getItem('openai-key')) return;

    const prompt = getPrompt(word, type);
    if (!prompt) return;
    console.debug('Image prompt', prompt);
    setLoading(true);
    getGeneratedImage(prompt);
  }, [loading, image, word, type, getGeneratedImage]);


  return [image, loading] as const;
}
