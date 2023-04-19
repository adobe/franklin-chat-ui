import ReactDOM from 'react-dom/client';
import {AuthProvider} from './AuthProvider';
import {Provider} from '@adobe/react-spectrum';
import {defaultTheme} from '@adobe/react-spectrum';
import {ApplicationProvider} from './ApplicationProvider';
import ChatComponent from './ChatComponent';
import React from 'react';
import './index.css';

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
