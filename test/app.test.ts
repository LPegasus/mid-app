import { expect } from 'chai';
import reduxLogger from 'redux-logger';
import App from '../src/App';

describe('app middleware test', () => {
  let app: App<any>;
  before(() => {
    const ctx = {
      get name() {
        return 'app-context';
      },
      cnt: 0,
    };
    app = new App(ctx, { name: 'LP', age: 18, cnt: 99 });
  });

  it('addAction & run & removeAction & run', () => {
    const deleteAction = app.addAction('delay-merge', async ({ getState, ctx }, action, next) => {
      ctx.cnt++;
      return new Promise(r => setTimeout(() => r({ ...getState(), cnt: ctx.cnt }), 300));
    });

    const p: Promise<any> = app.dispatch({
      type: 'delay-merge',
    });

    expect(app.getState().cnt).to.be.eq(99);
    expect(p.then && typeof p.then === 'function').to.be.true;
    expect(app.getState().cnt).to.be.eq(99);

    return p.then(() => {
      expect(app.getState().cnt).to.be.eq(1);
      app.removeAction('delay-merge');
    }).then(() => new Promise(r => {
      app.dispatch({
        type: 'delay-merge'
      }).then(() => {
        throw new Error('Should get an error. But none error was caught');
      }, err => {
        expect(err).to.be.eq(`type delay-merge is not found.`);
        r();
      });
    }));
  });

  it('add other middleware', () => {

  });
});
