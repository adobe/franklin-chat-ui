import React, { useCallback, useEffect } from 'react';
import {ComboBox, Item, Picker} from '@adobe/react-spectrum';
import {useApplicationContext} from './ApplicationProvider';
import {useIsConnected} from './ConnectedHook';

export function MemberPicker({ onChange, ...props }) {
  const {chatClient} = useApplicationContext();
  const [items, setItems] = React.useState([]);
  const isConnected = useIsConnected();

  useEffect(() => {
    if (!isConnected || !chatClient) {
      return;
    }
    console.log('getting members...');
    chatClient.getMembers().then((members) => {
      setItems(members);
    }).catch((e) => {
      console.error('failed to get members', e);
    });
  }, [isConnected, chatClient, setItems]);

  const selectionHandler = useCallback((selected) => {
    onChange(items.find((item) => item.id === selected));
  }, [items, onChange]);

  return (
    <ComboBox
      allowsCustomValue={false}
      isDisabled={!isConnected || items.length === 0}
      items={items}
      onSelectionChange={selectionHandler}>
      {items ? items.map((item, index) => <Item key={item.id}>{item.name}</Item>) : []}
    </ComboBox>
  );
}
