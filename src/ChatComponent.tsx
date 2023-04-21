import React, {useCallback, useEffect} from 'react';
import {
  ActionButton,
  Badge,
  Button,
  DialogTrigger,
  Divider,
  Flex,
  Text,
  useProvider,
  View
} from '@adobe/react-spectrum';
import DefaultUserIcon from './user.png';
import Chat from '@spectrum-icons/workflow/Reply';
import Logout from '@spectrum-icons/workflow/LogOut';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import {useApplicationContext} from './ApplicationProvider';
import InfiniteScroll from 'react-infinite-scroll-component';
import {useAuthContext} from './AuthProvider';
import {ThreadComponent} from './ThreadComponent';
import {MessageEditorComponent} from './MessageEditorComponent';
import {convertSlackTimestampToUTC, convertSlackToHtml} from './Utils';
import {ChatTitle} from './ChatTitle';

function ChatComponent(){
  const application = useApplicationContext();
  const {colorScheme} = useProvider();
  const {logout} = useAuthContext();

  const [history, setHistory] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [title, setTitle] = React.useState('Connecting...');

  const [connected, setConnected] = React.useState(false);

  const [highlightedItem, setHighlightedItem] = React.useState(undefined);

  useEffect(() => {
    application.chatClient.addConnectionCallback((connected: boolean) => {
      console.log('onConnection', connected);
      if (connected) {
        const channelName = application.chatClient.getChannelName() as string;
        setTitle(`You are chatting in ${channelName.toUpperCase()}`);
      }
      setConnected(connected);
    });
    application.chatClient.addMessageCallback((history: any[]) => {
      console.log('onMessage', history);
      setHistory([...history]);
    });
  }, [application]);

  const fetchMoreData = useCallback(async () => {
    console.log('fetchMoreData');
    setHasMore(await application.chatClient.requestHistory());
  }, [application.chatClient]);

  const onSend = (message: string) => {
    console.log(`sending message ${message}...`);
    application.chatClient.send(message);
  }

  return(
    <Flex direction="column" gap="size-100" height='100%' justifyContent='center'>
      <Flex direction={'row'} alignItems={'center'} justifyContent={'space-between'} margin={10} gap={10}>
        <Badge alignSelf="center" variant={connected ? 'positive' : 'negative'}><CheckmarkCircle /></Badge>
        <ChatTitle title={title} colorScheme={colorScheme}/>
        <View flexGrow={1}/>
        <Button onPress={logout} variant='primary' isDisabled={!connected}>Logout&nbsp;<Logout/></Button>
      </Flex>
      <Divider orientation="horizontal" size="S" />
      <div
        id="scrollableDiv"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column-reverse',
          width: '100%',
          scrollbarColor: colorScheme,
          scrollbarWidth: 'thin'
        }}
      >
        <InfiniteScroll
          dataLength={history.length}
          next={fetchMoreData}
          style={{ display: 'flex', flexDirection: 'column-reverse', marginLeft: 5, marginRight: 5 }}
          inverse={true}
          hasMore={hasMore}
          loader={<div style={{margin:'auto', padding: 'auto'}}>Loading...</div>}
          scrollableTarget="scrollableDiv"
        >
          {history.map((item, index) => (
            <div key={item.ts} style={{marginTop: 5, marginBottom: 5}} onMouseOver={() => setHighlightedItem(item.ts)}>
              <Flex direction="row" flex={1} flexGrow={1}>
                <img src={item.user?.icon ?? DefaultUserIcon} width={42} height={42} style={{borderRadius: '50%', border: '1px', margin: 5}} alt='avatar'/>
                <Flex direction="column" flex={1} position='relative'>
                  <Flex direction="row">
                    <Flex direction="column" flexBasis='auto'>
                      <h4 style={{margin: 0}}>{item.user.name}</h4>
                      <div style={{fontSize: 10}}>{convertSlackTimestampToUTC(item.ts)}</div>
                    </Flex>
                    <DialogTrigger type="modal" isDismissable>
                      <ActionButton marginStart='size-100' isQuiet isHidden={highlightedItem !== item.ts}><Chat/></ActionButton>
                      {(close) => <ThreadComponent ts={item.ts} close={close}/>}
                    </DialogTrigger>
                  </Flex>
                  <p style={{fontSize: 15, marginTop: 5, marginBottom: 5, lineHeight: 1.2}} dangerouslySetInnerHTML={{__html: convertSlackToHtml(item.text)}}/>
                  { item.replyCount &&
                    <div>
                      <DialogTrigger type="modal" isDismissable>
                        <ActionButton isQuiet><Text><b>{item.replyCount}</b>&nbsp;{item.replyCount === 1 ? 'reply' : 'replies'}</Text></ActionButton>
                        {(close) => <ThreadComponent ts={item.ts} close={close}/>}
                      </DialogTrigger>
                    </div>
                  }
                </Flex>
              </Flex>
            </div>
          ))}
        </InfiniteScroll>
      </div>
      <Divider orientation="horizontal" size="S" />
      <MessageEditorComponent onSend={onSend}/>
    </Flex>
  )
}

export default ChatComponent;
