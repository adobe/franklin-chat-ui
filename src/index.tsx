import ReactDOM from 'react-dom/client';
import './index.css';
import {AuthProvider} from './AuthProvider';
import {ActionButton, Badge, Flex, Provider} from '@adobe/react-spectrum';
import {defaultTheme} from '@adobe/react-spectrum';
import {ApplicationProvider} from './ApplicationProvider';
import ChatComponent from './ChatComponent';
import React from 'react';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider theme={defaultTheme} height='100%'>
    <AuthProvider>
      <ApplicationProvider>
        <ChatComponent/>
      </ApplicationProvider>
    </AuthProvider>
  </Provider>
);
