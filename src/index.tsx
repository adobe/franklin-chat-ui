import ReactDOM from 'react-dom/client';
import './index.css';
import {Main} from './Main';
import {ApplicationProvider} from './Application';
import MagicAuthProvider from './auth/MagicAuthProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ApplicationProvider>
    <div className="content-padding">
      <MagicAuthProvider magicApiKey={process.env.REACT_APP_MAGIC_LINK_KEY as string}>
        <Main />
      </MagicAuthProvider>
    </div>
  </ApplicationProvider>
);
