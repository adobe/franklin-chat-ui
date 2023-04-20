import React, {useCallback, useEffect} from 'react';
import {ActionButton, Badge, DialogTrigger, Flex, Image, Text, View} from '@adobe/react-spectrum';
import DefaultUserIcon from './user.png';
import Chat from '@spectrum-icons/workflow/Reply';
import CheckmarkCircle from '@spectrum-icons/workflow/CheckmarkCircle';
import {useApplicationContext} from './ApplicationProvider';
import InfiniteScroll from 'react-infinite-scroll-component';
import {useAuthContext} from './AuthProvider';
import {ThreadComponent} from './ThreadComponent';
import {MessageEditorComponent} from './MessageEditorComponent';
import {convertSlackTimestampToUTC, convertSlackToHtml} from './Utils';

function ChatComponent(){
  const application = useApplicationContext();
  const {logout} = useAuthContext();

  const [history, setHistory] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);
  const [channelName, setChannelName] = React.useState('');

  const [connected, setConnected] = React.useState(false);

  const [highlightedItem, setHighlightedItem] = React.useState(undefined);

  useEffect(() => {
    application.chatClient.addConnectionCallback((connected: boolean) => {
      console.log('onConnection', connected);
      if (connected) {
        setChannelName(application.chatClient.getChannelName() as string);
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
      <div style={{display: 'flex', flexDirection: 'row', gap:10, alignItems: 'center', margin: 0, padding: 10, background: '#eee', borderRadius: 5}}>
        <h2 style={{margin: 0, color: '#aaa'}}>You are now chatting in <b style={{color:'#666', display: 'inline'}}>{channelName}</b></h2>
        <View flexGrow={1}/>
        <Badge alignSelf="center" variant={connected ? 'positive' : 'negative'}><CheckmarkCircle /></Badge>
        <ActionButton onPress={logout}>Logout</ActionButton>
      </div>
      <div
        id="scrollableDiv"
        style={{
          overflow: 'auto',
          display: 'flex',
          flexGrow: 1,
          flexDirection: 'column-reverse',
          width: '100%',
        }}
      >
        <InfiniteScroll
          dataLength={history.length}
          next={fetchMoreData}
          style={{ display: 'flex', flexDirection: 'column-reverse' }}
          inverse={true}
          hasMore={hasMore}
          loader={<div style={{margin:'auto', padding: 'auto'}}>Loading...</div>}
          scrollableTarget="scrollableDiv"
        >
          {history.map((item, index) => (
            <div key={item.ts} style={{marginTop: 5, marginBottom: 5}} onMouseOver={() => setHighlightedItem(item.ts)}>
              <Flex direction="row" flex={1} flexGrow={1}>
                <Image src={item.user?.icon ?? DefaultUserIcon} width={42} height={42} margin={6}/>
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

      <MessageEditorComponent onSend={onSend}/>
    </Flex>
  )
}

export default ChatComponent;
