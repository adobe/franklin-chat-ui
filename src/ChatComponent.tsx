import React, {useEffect} from 'react';
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
import {useApplicationContext} from './Application';

function ChatComponent(){
  const application = useApplicationContext();

  const [history, setHistory] = React.useState<any[]>([]);

  const [connected, setConnected] = React.useState(false);
  const [name, setName] = React.useState('User 1');
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    application.chatClient.addConnectionCallback((connected: boolean) => {
      console.log('onConnection', connected);
      setConnected(connected);
    });
    application.chatClient.addMessageCallback((history: any[]) => {
      console.log('onMessage', history);
      setHistory([...history]);
    });
  }, [application]);

  const onSend = () => {
    application.chatClient.send(name, message);
    setMessage('');
  }

  console.log('history', history);

  return(
    <Flex direction="column" gap="size-100" height="100%">
      <Flex direction="row" gap="size-100" margin='size-200'>
        <TextField label="Name" labelPosition="side" onChange={setName} value={name} />
        <Badge alignSelf="center" variant={connected ? 'positive' : 'negative'}><CheckmarkCircle /></Badge>
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
