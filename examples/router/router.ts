import RouterApp from './router-example.js';
import { render } from 'reactive-dom';
import styles from './router.module.css';

// Create the router app
export const createRouterApp = () => {
  return RouterApp();
};

// Initialize the router app
export const initRouterApp = () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    render(() => createRouterApp(), appElement);
  }
};
