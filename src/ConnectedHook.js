import {useApplicationContext} from './ApplicationProvider';
import React, {useEffect} from 'react';
import {ConnectionStatus} from './ChatClient';

export function useIsConnected() {
  const {chatClient} = useApplicationContext();
  const [connected, setConnected] = React.useState(false);

  useEffect(() => {
    const statusCallback = (status) => {
      setConnected(status === ConnectionStatus.CONNECTED);
    };
    chatClient.addStatusCallback(statusCallback);
    return () => {
      chatClient.removeStatusCallback(statusCallback);
    };
  }, [chatClient, setConnected]);

  return connected;
}
