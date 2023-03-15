import ReactDOM from 'react-dom/client';
import './index.css';
import {Main} from './Main';
import {ApplicationProvider} from './Application';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <ApplicationProvider>
    <div className="content-padding">
      <Main />
    </div>
  </ApplicationProvider>
);
