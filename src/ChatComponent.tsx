import React, {useEffect, useMemo} from 'react';
import {
  ActionMenu,
  Button,
  ButtonGroup,
  Flex,
  Item, ListView,
  TextArea,
  Text,
  Image, TextField, Badge
} from '@adobe/react-spectrum';
import user from './user.png';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import { useMagicAuth } from './auth/useMagicAuth';

import {ChatClient} from './ChatClient';

function ChatComponent(){
  const [history, setHistory] = React.useState<any[]>([]);

  const [connected, setConnected] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const {
    metadata,
  } = useMagicAuth();

  const name = `${metadata?.email || ''}`;
  console.log('metadata', metadata);

  const chatClient = useMemo(() => new ChatClient(), []);

  useEffect(() => {
    chatClient.addConnectionCallback((connected: boolean) => {
      console.log('onConnection', connected);
      setConnected(connected);
    });
    chatClient.addMessageCallback((history: any[]) => {
      console.log('onMessage', history);
      setHistory([...history]);
    });
  }, [chatClient]);

  const onSend = () => {
    chatClient.send(`${name} (from Magic Link)`, message);
    setMessage('');
  }

  console.log('history', history);

  return(
    <Flex direction="column" gap="size-100" height="100%">
      <Flex direction="row" gap="size-100" margin='size-200'>
        <h1>Welcome to Franklin chat {name}</h1>
        <Badge alignSelf="center" variant={connected ? 'positive' : 'negative'}><CheckmarkCircle /><Text>{connected ? 'Chat is connected' : 'Chat is offline'}</Text></Badge>
      </Flex>
      <ListView
        items={history}
        flex={1}
      >
        {(item) =>
          <Item key={item.id}>
            <Image
              src={user}
            />
            <Text>{item.name}</Text>
            <Text slot="description">{item.text}</Text>
            <ActionMenu>
              <Item key="edit" textValue="Edit">
                <Edit />
                <Text>Edit</Text>
              </Item>
              <Item key="delete" textValue="Delete">
                <Delete />
                <Text>Delete</Text>
              </Item>
            </ActionMenu>
          </Item>
        }
      </ListView>
      <TextArea width="100%" onChange={setMessage} value={message} />
      <ButtonGroup width="100%">
        <Button variant="primary" onPress={onSend}>Send</Button>
      </ButtonGroup>
    </Flex>
  )
}

export default ChatComponent;
