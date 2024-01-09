import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DownloadIcon } from 'primereact/icons/download';
import { InputText } from 'primereact/inputtext';
import { PDF } from './pdf';
import { useImage, useURLParams, useWord } from './useOpenAI';
import { useCallback, useState } from 'react';
import {  useLocalStorage } from 'react-use';
import { ProgressBar } from 'primereact/progressbar';

export function App() {
  const params = useURLParams();

  const [inputText, setInputText] = useState(params.get('word'));
  const [inputImg, setInputImg] = useState(params.get('imageUrl'));

  const [text, setText] = useState('');

  const onStart = useCallback(() => setText(inputText || ''), [inputText]);

  const [word, loading] = useWord({ word: text || params.get('word') || undefined, language: 'swedish' });
  const [image, imageLoading] = useImage(inputImg || params.get('imageUrl') || undefined, word?.english?.word, word?.type);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage('openai-key', '');

  return (
    <>
      <Toolbar
        start={
          <div style={{ flexDirection: 'row', display: 'flex', gap: 16 }}>
            <InputText placeholder='Word...' value={inputText || ''} onChange={(e) => setInputText(e.target.value)}  />
            <InputText placeholder='Image URL...' value={inputImg || ''} onChange={(e) => setInputImg(e.target.value)} />
            <Button icon={<DownloadIcon />} onClick={onStart} />
          </div>
        }
        end={<Button label='OpenAPI API Key' onClick={() => setDialogVisible(true)}/>}
      />

      <Dialog
        visible={dialogVisible}
        modal
        content={
          <InputText placeholder='API key' value={apiKey} onChange={(e) => setApiKey(e.target.value)} onKeyDown={(e) => e.key?.toLowerCase() === 'enter' && setDialogVisible(false)} />
        }
        onHide={() => setDialogVisible(false)}
      />

      {!apiKey?.trim() ? "No API Key" : (
      <>
        {loading || imageLoading
          ? <ProgressBar mode="indeterminate" style={{ height: '6px' }}></ProgressBar>
          : (
            <PDF
              word={word?.swedish?.word || ''}
              variations={word?.swedish?.variations}
              image={image || ''}
              type={word?.type}
            />
              )}
          </>
      )}
    </>
  )

}

export default App;
