import React from 'react';
import {KeyboardEvent} from '@react-types/shared';
import {Button, ButtonGroup, Flex, TextArea} from '@adobe/react-spectrum';

export function MessageEditorComponent({onSend}: {onSend: (message: string) => void}) {
  const [message, setMessage] = React.useState('');

  const onDone = () => {
    onSend(message);
    setMessage('');
  }

  const onEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      onDone();
      e.preventDefault();
    }
  };

  return (
    <Flex direction='column' margin={10}>
      <TextArea width="100%" onChange={setMessage} onKeyDown={onEnter} value={message} description="Shift+Enter to send"/>
      <ButtonGroup width="100%">
        <Button variant="primary" onPress={onDone} isDisabled={!message.length}>Send</Button>
      </ButtonGroup>
    </Flex>
  );
}
