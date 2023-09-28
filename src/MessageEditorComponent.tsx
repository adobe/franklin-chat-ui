import React, {useCallback, useRef} from 'react';
import {KeyboardEvent} from '@react-types/shared';
import {
  ActionButton,
  Button,
  ButtonGroup,
  Flex,
  Item,
  Menu,
  MenuTrigger,
  TextArea,
} from '@adobe/react-spectrum';
import Send from '@spectrum-icons/workflow/Send';
import {convertAllUnicodeToEmoji} from './Utils';
import {useApplicationContext} from './ApplicationProvider';

export function MessageEditorComponent({thread_ts}: {thread_ts?: string}) {
  const {chatClient} = useApplicationContext();
  const [message, setMessage] = React.useState('');

  const inputRef = useRef<any>(null);

  const onDone = () => {
    console.log(`sending message ${message}...`);
    chatClient.postMessage((convertAllUnicodeToEmoji(message)), thread_ts);
    setMessage('');
  }

  const onEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        setMessage(message + '\n');
      } else {
        onDone();
      }
    }
  };

  const wrapSelectedText = useCallback((wrapper: string) => {
    const textarea = inputRef.current.getInputElement() as HTMLTextAreaElement;
    if (textarea && textarea.value) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const wrappedText = `${wrapper}${selectedText}${wrapper}`;
        setMessage(text.substring(0, start) + wrappedText + text.substring(end));
        textarea.focus();
      }
    }
  }, [inputRef]);

  const insertEmoji = useCallback((emoji: string) => {
    const textarea = inputRef.current.getInputElement() as HTMLTextAreaElement;
    if (textarea && textarea.value !== undefined) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      setMessage(newText);
      textarea.focus();
    }
  }, [inputRef]);

  return (
    <Flex direction='column' margin={10}>
      <ButtonGroup>
        <ActionButton isQuiet onPress={() => wrapSelectedText('*')}>B</ActionButton>
        <ActionButton isQuiet onPress={() => wrapSelectedText('_')}>I</ActionButton>
        <MenuTrigger>
          <ActionButton isQuiet>🙂</ActionButton>
          <Menu onAction={(key) => insertEmoji(key as string)}>
            <Item key="🙂">🙂</Item>
            <Item key="😉">😉</Item>
            <Item key="😄">😄</Item>
            <Item key="😆">😆</Item>
            <Item key="😕">😕</Item>
            <Item key="👍">👍</Item>
            <Item key="👎">👎</Item>
          </Menu>
        </MenuTrigger>
      </ButtonGroup>
      <TextArea width="100%" onChange={setMessage} onKeyDown={onEnter} value={message} description="Shift+Enter for new line" height='100px' ref={inputRef} aria-label="Enter your message here"/>
      <ButtonGroup width="100%">
        <Button variant="primary" onPress={onDone} isDisabled={!message.length}>Send<Send/></Button>
      </ButtonGroup>
    </Flex>
  );
}
