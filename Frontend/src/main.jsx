
import { createRoot } from 'react-dom/client'
import '../src/app/index.css'
import { store } from './app/app.store';
import { Provider } from 'react-redux';
import App from './app/App';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
   <App />
  </Provider>
);