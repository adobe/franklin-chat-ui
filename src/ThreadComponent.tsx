import {useApplicationContext} from './ApplicationProvider';
import React, {useCallback, useEffect} from 'react';
import {Message} from './ChatClient';
import {Content, Dialog, Divider, Flex, Heading, IllustratedMessage, Image} from '@adobe/react-spectrum';
import DefaultUserIcon from './user.png';
import {MessageEditorComponent} from './MessageEditorComponent';
import {convertSlackTimestampToUTC, convertSlackToHtml} from './Utils';

export function ThreadComponent({ ts, close }: {ts: string, close: () => void}) {
  const {chatClient} = useApplicationContext();
  const [replies, setReplies] = React.useState<Message[]>([]);

  const fetchMoreData = useCallback(async () => {
    console.log(`fetching replies for ${ts}...`);
    const replies = await chatClient.getReplies(ts);
    setReplies(replies);
    console.log('replies', replies);
  }, [chatClient, ts]);

  useEffect(() => {
    chatClient.addMessageCallback((history: any[]) => {
      fetchMoreData().catch(console.error);
    });
    fetchMoreData().catch(console.error);
  }, [chatClient, fetchMoreData]);

  return (
    <Dialog>
      <Heading>Thread</Heading>
      <Divider />
      <Content>
        <Flex direction="column" gap="size-100">
          {replies.map((item) => (
            <div key={item.ts} style={{marginTop: 5, marginBottom: 5, paddingLeft: item.ts === ts ? 0 : 20}}>
              <Flex direction="row" flex={1} flexGrow={1}>
                <Image src={item.user?.icon ?? DefaultUserIcon} width={42} height={42} margin={6} alt="Avatar"/>
                <Flex direction="column" flex={1} position='relative'>
                  <Flex direction="row">
                    <Flex direction="column" flexBasis='auto'>
                      <h4 style={{margin: 0}}>{item.user.name}</h4>
                      <div style={{fontSize: 10}}>{convertSlackTimestampToUTC(item.ts)}</div>
                    </Flex>
                  </Flex>
                  <p style={{fontSize: 15, marginTop: 5, marginBottom: 5, lineHeight: 1.2}}
                     dangerouslySetInnerHTML={{__html: convertSlackToHtml(item.text, chatClient.getTeamId() as string)}}/>
                </Flex>
              </Flex>
              { item.ts === ts &&
                <div style={{color: '#999', fontSize: 11}}>{replies.length - 1} replies<div style={{backgroundColor: '#ccc', height: 1, width: '95%'}}/></div>
              }
            </div>
          ))}
          {replies.length < 2 &&
            <IllustratedMessage>
              <Content>
                No replies to this message yet
              </Content>
            </IllustratedMessage>
          }
        </Flex>
        <MessageEditorComponent thread_ts={ts}/>
      </Content>
    </Dialog>);
}
