import { expect } from 'chai';
import { createStore } from 'redux';
import logger from 'redux-logger';
import asyncFuncMid from 'redux-mid-async-func';
import MiddlewareContainer from '../src/MiddlewareContainer';

describe('haha', () => {
  let store;
  before(() => {
    const container = new MiddlewareContainer();
    container.add('async', asyncFuncMid);
    container.add('logger', logger);
    container.add('delay', (getState, dispatch) => next => action => {
      if (action.delay > 0) {
        return new Promise(r => {
          setTimeout(() => {
            r(next(action));
          }, action.delay);
        })
      } else {
        return next(action);
      }
    });

    store = createStore(
      (state: any, action) => {
        const nextState = { ...state };
        if (action.type === 'add') {
          nextState.count = state.count + 1;
        }
        return nextState;
      },
      { count: 1 },
      container.asMiddleware(),
    );
  });

  it('add', done => {
    expect(store.getState().count).to.be.eq(1);
    expect(typeof store.dispatch({ type: 'add' }).then).to.be.eq('function', 'dispatch result should be a promise');
    expect(store.getState().count).to.be.eq(2);
    expect(store.dispatch({ type: 'add' }, { skip: ['async'] })).to.be.deep.eq({ type: 'add' }, 'a dispatch with out async middleware and the result should not be a promise.');
    expect(store.getState().count).to.be.eq(3);

    Promise.race(store.dispatch({ type: 'add', delay: 500 });
  });
});
