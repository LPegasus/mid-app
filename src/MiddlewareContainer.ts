import * as Redux from 'redux';
import { compose } from 'redux';

/**
 * 管理 middle 运行的容器
 *
 * @export
 * @class MiddlewareContainer
 * @template S
 */
export default class MiddlewareContainer<S = {}> {
  private middlewares: Map<string, Redux.Middleware>;
  private store!: Redux.Store<S>;

  constructor() {
    this.middlewares = new Map<string, Redux.Middleware>();
  }

  /**
   * 注册 middleware
   *
   * @param {string} id 每个 middleware 的唯一标识
   * @param {(IMiddleware | Middleware)} middleware
   * @returns
   * @memberof MiddlewareContainer
   */
  public add = (id: string, middleware: any) => {
    let mid = this.middlewares.get(id);
    if (mid) {
      console.error(`middleware id: ${id} already exists.`);
      return;
    }
    this.middlewares.set(id, middleware);
  }

  /**
   * 注销 middleware
   *
   * @param {string} id 每个 middleware 的唯一标识
   * @returns
   * @memberof MiddlewareContainer
   */
  public remove = (id: string) => {
    const middleware = this.middlewares[id];
    if (!middleware) {
      console.error(`middleware id: ${id} does not exist.`);
      return;
    }

    delete this.middlewares[id];
    return;
  }

  /**
   * store 最终使用的 middleware
   *
   * @memberof MiddlewareContainer
   */
  public asMiddleware = () => {
    return createStore => (...args) => {
      this.store = createStore(...args)

      return {
        ...this.store,
        dispatch: this.dispatch,
      } as Redux.Store<S>;
    }
  }

  public dispatch = (action: Redux.AnyAction, options: { use?: string[]; skip?: string[] } = {}) => {
    const use = options.use;
    const skip = options.skip;
    const middlewareWrapperList: Redux.Middleware[] = [];
    const api = {
      dispatch: this.store.dispatch,
      getState: this.store.getState,
    }

    /**
     * 过滤出需要使用的 middlewares
     */
    for (let [id, middleware] of this.middlewares.entries()) {
      let needRun: boolean = true;
      if (use) {
        needRun = use.indexOf(id) !== -1;
      } else if (skip) {
        needRun = skip.indexOf(id) === -1;
      }

      if (needRun) {
        middlewareWrapperList.push(middleware);
      }
    }

    return compose<Redux.Dispatch<any>>(...middlewareWrapperList.map(mid => mid(api)))(this.store.dispatch)(action);

  }

  /**
   * 批量注入 middlewares
   * 例子：store = createStore(reducer, initialState, (new MiddlewareContainer()).applyMiddleware())
   *
   * @param {(Array<{id: string; middleware: IMiddleware<S> | Middleware}>)} middlewareList
   * @returns
   * @memberof MiddlewareContainer
   */
  public applyMiddleware = (middlewareList: Array<{ id: string; middleware: Redux.Middleware }>) => {
    middlewareList.forEach(d => {
      this.add(d.id, d.middleware);
    });

    return this.asMiddleware();
  }
}
