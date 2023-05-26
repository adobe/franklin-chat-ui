import {
  Content,
  Dialog,
  DialogContainer,
  Divider,
  Flex,
  Heading,
} from '@adobe/react-spectrum';
import ImageCheck from '@spectrum-icons/ui/InfoMedium';
import React from 'react';

export function BusyDialog({text}: {text: string}) {
  return (
    <DialogContainer onDismiss={() => console.log('')} type="modal">
      <Dialog>
        <Heading>Preparing chat...</Heading>
        <Divider />
        <Content>
          <Flex direction="row" alignItems="center" gap={10}>
            <ImageCheck/>
            <div>{text}</div>
          </Flex>
        </Content>
      </Dialog>
    </DialogContainer>
  );
}
