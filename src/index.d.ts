declare type PrimitiveType = number | boolean | null | undefined | string;

declare type DispatchParamType = { type: string; payload?: { [key: string]: PrimitiveType } };

declare type StateType = { [key: string]: PrimitiveType };

declare interface DispatchFunc {
  (action: DispatchParamType): DispatchParamType;
}

declare interface GetStateFunc {
  (): any;
}

declare interface MiddlewareAPI {
  getState: any;
  dispatch: DispatchFunc;
}
