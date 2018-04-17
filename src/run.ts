import App from './App';
import { createStore, applyMiddleware } from 'redux';

const middle = (ctx, funcAPI) => (middlewareAPI: MiddlewareAPI) => {
  return (next: DispatchFunc) => (action: DispatchParamType) => {

  }
}

const app = new App();
app.addAction('test-setvalue', async function ({ state, ctx }, action, next) {
  ctx.logger(action);
  return {
    ...state,
    ...action.payload,
  };
});

