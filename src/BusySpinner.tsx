import {Content, Dialog, DialogContainer, Flex, ProgressCircle} from '@adobe/react-spectrum';
import React from 'react';

export function BusySpinner({text}: {text: string}) {
  return (
    <DialogContainer onDismiss={() => console.log('')} type="modal">
      <Dialog>
        <Content>
          <Flex direction="row" alignItems="center" gap={10}>
            <ProgressCircle/>
            <div>{text}</div>
          </Flex>
        </Content>
      </Dialog>
    </DialogContainer>
  );
}
