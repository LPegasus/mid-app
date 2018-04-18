import { createStore, applyMiddleware, Store } from 'redux';
import * as Redux from 'redux';

export type AppMiddleware<T> = (api: { getState: () => any, ctx: T }, action: any, next: (action: any) => Promise<any>) => Promise<any>;

const REPLACE_STATE_ACTION_TYPE = 'REPLACE_STATE_ACTION_TYPE';

export default class App<T extends { [key: string]: any } = {}> {
  private _ctx: T & { locals: { [key: string]: any } };
  private _actions: Map<string, AppMiddleware<T>>;
  private _store: Store<StateType>;
  private _middlewares: Map<string, Redux.Middleware>;

  constructor(ctx?: T, state = {}) {
    this._store = createStore(
      replaceState,
      state,
      applyMiddleware(middlewareAPI => next => action => {
        return this.handle(action, middlewareAPI, next);
      }));
    this._ctx = { ...(ctx || {}), locals: {} } as T & { locals: { [key: string]: any } };
    this._actions = new Map<string, AppMiddleware<T>>();
    this._middlewares = new Map();
  }

  addAction(type: string, func: AppMiddleware<T>) {
    this._actions.set(type, func);
    return this;
  }

  removeAction(type: string) {
    this._actions.delete(type);
  }

  addMiddleware(id: string, middleware: Redux.Middleware) {
    this._middlewares.set(id, middleware);
    return this;
  }

  removeMiddleware(id: string) {
    this._middlewares.delete(id);
    return this;
  }

  handle(action: any, middlewareAPI: MiddlewareAPI, nextMiddleware) {
    const processer = this._actions.get(action.type);

    const next = subAction => this.handle(subAction, middlewareAPI, nextMiddleware);

    let actionResult;
    if (!processer) {
      actionResult = nextMiddleware(action);
      if (action.type === REPLACE_STATE_ACTION_TYPE) {
        return Promise.resolve(action.payload);
      } else {
        return Promise.reject(`type ${action.type} is not found.`);
      }
    } else {
      actionResult = processer.call(null,
        {
          getState: middlewareAPI.getState,
          ctx: this._ctx,
        },
        action,
        next,
      );
    }

    return actionResult.then(rtn => {
      if (typeof rtn === 'object') {
        return middlewareAPI.dispatch({ type: REPLACE_STATE_ACTION_TYPE, payload: rtn });
      }
      return rtn;
    });
  }

  getState() {
    return this._store.getState();
  }

  dispatch(action) {
    return this._store.dispatch(action);
  }
}

function replaceState(state: StateType, action: any) {
  if (action.type === REPLACE_STATE_ACTION_TYPE) {
    state = action.payload;
  }
  return state;
}
