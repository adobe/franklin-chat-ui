import React, {useCallback, useEffect} from 'react';
import {
  ActionButton,
  Button,
  DialogTrigger,
  Divider,
  Flex, Image,
  Text,
  useProvider,
  View
} from '@adobe/react-spectrum';
import Logo from './logo.png';
import DefaultUserIcon from './user.png';
import { FaPlug } from 'react-icons/fa';
import Link from '@spectrum-icons/workflow/Link';
import Chat from '@spectrum-icons/workflow/Reply';
import Logout from '@spectrum-icons/workflow/LogOut';
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
        const TEAM_ID = application.chatClient.getTeamId();
        const channelId = application.chatClient.getChannelId() as string;
        const channelName = application.chatClient.getChannelName() as string;
        setTitle(`You are chatting in <a href="slack://channel?team=${TEAM_ID}&id=${channelId}">${channelName}</a>`);
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

  return(
    <Flex direction="column" gap="size-100" height='100%' justifyContent='center'>
      <Flex direction={'row'} alignItems={'center'} justifyContent={'space-between'} margin={10} gap={10}>
        <Image src={Logo} width={32} height={32}/>
        <ChatTitle title={title} colorScheme={colorScheme}/>
        <View flexGrow={1}/>
        <FaPlug color={connected ? 'green' : '#ccc'} size={20}/>
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
                  <p style={{fontSize: 15, marginTop: 5, marginBottom: 5, lineHeight: 1.2}}
                     dangerouslySetInnerHTML={{__html: convertSlackToHtml(item.text, application.chatClient.getTeamId() as string)}}/>
                  { (item.files && item.files.length > 0) &&
                    <div>
                      {item.files.map((file: any) => (
                        <Flex direction='row' key={file.id} gap={10}>
                          <Link size='M'/>
                          <a href={file.url} target='_blank' rel='noreferrer'>{file.name}</a>
                        </Flex>
                      ))}
                    </div>
                  }
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
      <MessageEditorComponent/>
    </Flex>
  )
}

export default ChatComponent;
