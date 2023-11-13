import React, {useCallback, useEffect} from 'react';
import {
  ActionButton, AlertDialog,
  Button, DialogContainer,
  DialogTrigger,
  Divider,
  Flex,
  Image,
  Text,
  useProvider,
  View
} from '@adobe/react-spectrum';
import Logo from './logo.png';
import DefaultUserIcon from './user.png';
import Link from '@spectrum-icons/workflow/Link';
import Chat from '@spectrum-icons/workflow/Reply';
import Logout from '@spectrum-icons/workflow/LogOut';
import {useApplicationContext} from './ApplicationProvider';
import InfiniteScroll from 'react-infinite-scroll-component';
import {useAuthContext} from './AuthProvider';
import {ThreadComponent} from './ThreadComponent';
import {MessageEditorComponent} from './MessageEditorComponent';
import {convertSlackTimestampToUTC, convertSlackToHtml, getAppVersion} from './Utils';
import {ChatTitle} from './ChatTitle';
import {ConnectionStatus} from "./ChatClient";

function ChatComponent(){
  const application = useApplicationContext();
  const {colorScheme} = useProvider();
  const {logout} = useAuthContext();

  const [history, setHistory] = React.useState<any[]>([]);
  const [hasMore, setHasMore] = React.useState(true);

  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = React.useState<Error|undefined>(undefined);

  const [highlightedItem, setHighlightedItem] = React.useState(undefined);

  useEffect(() => {
    application.chatClient.addStatusCallback((status: ConnectionStatus) => {
      console.log('onStatus', status);
      setConnectionStatus(status);
    });
    application.chatClient.addMessageCallback((history: any[]) => {
      console.log('onMessage', history);
      setHistory([...history]);
    });
    application.chatClient.addErrorCallback((error: Error) => {
      console.log('onError', error);
      setError(error);
    });
  }, [application]);

  const fetchMoreData = useCallback(async () => {
    console.log('fetchMoreData');
    setHasMore(await application.chatClient.requestHistory());
  }, [application.chatClient]);

  return(
    <Flex direction="column" gap="size-100" height='100%' justifyContent='center'>
      <Flex direction={'row'} alignItems={'center'} justifyContent={'space-between'} margin={10} gap={10}>
        <Image src={Logo} width={32} height={32} alt="Logo"/>
        <ChatTitle title={connectionStatus === ConnectionStatus.CONNECTED ? 'Connected to Adobe!' : 'Disconnected'} colorScheme={colorScheme}/>
        <View flexGrow={1}/>
        <Text>v{getAppVersion()}</Text>
        <Button onPress={logout} variant='primary' isDisabled={connectionStatus !== ConnectionStatus.CONNECTED}>Logout&nbsp;<Logout/></Button>
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
      <DialogContainer onDismiss={() => logout()}>
        {error &&
          <AlertDialog
            title="Ops! Something went wrong."
            variant="error"
            primaryActionLabel="Logout">
            You are probably not allowed to use the chat.<br/>
            Please contact Adobe support.
          </AlertDialog>
        }
      </DialogContainer>
    </Flex>
  )
}

export default ChatComponent;
