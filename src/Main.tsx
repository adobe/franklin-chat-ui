import './Main.css';
import {Provider, defaultTheme} from '@adobe/react-spectrum'
import React from 'react'
import ChatComponent from './ChatComponent';
import {ApplicationProvider} from './Application';

function Main() {
  return (
    <Provider theme={defaultTheme} colorScheme="light" height="100%">
      <div className="content-padding">
        <ApplicationProvider>
          <ChatComponent/>
        </ApplicationProvider>
      </div>
    </Provider>
  );
}

export default Main;
