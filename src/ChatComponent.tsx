import React, {useEffect} from 'react';
import {
  ActionMenu,
  Button,
  ButtonGroup,
  Flex,
  Item, ListView,
  TextArea,
  Text,
  Image, Badge
} from '@adobe/react-spectrum';
import user from './user.png';
import Edit from '@spectrum-icons/workflow/Edit';
import Delete from '@spectrum-icons/workflow/Delete';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import {useApplicationContext} from './Application';
import { useMagicAuth } from './auth/useMagicAuth';

function ChatComponent(){
  const application = useApplicationContext();
  const [history, setHistory] = React.useState<any[]>([]);

  const [connected, setConnected] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const {
    metadata,
    token,
  } = useMagicAuth();

  const name = `${metadata?.email || ''}`;
  console.log('metadata', metadata);

  if (!application.chatClient.isConnected()) {
    application.chatClient.connect({ user: metadata?.email as string, token: token as string });
  }

  useEffect(() => {
    application.chatClient.addConnectionCallback((connected: boolean) => {
      console.log('onConnection', connected);
      setConnected(connected);
    });
    application.chatClient.addMessageCallback((history: any[]) => {
      console.log('onMessage', history);
      setHistory([...history]);
    });
  }, [application.chatClient]);

  const onSend = () => {
    application.chatClient.send(`${name} (from Magic Link)`, message);
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
        aria-label="Chat history"
      >
        {(item) =>
          <Item key={item.id} aria-label={item.name}>
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
      <TextArea width="100%" onChange={setMessage} value={message} aria-label="Write message here"/>
      <ButtonGroup width="100%">
        <Button variant="primary" onPress={onSend}>Send</Button>
      </ButtonGroup>
    </Flex>
  )
}

export default ChatComponent;
