var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
import { createContext, useContext, useEffect, useState, useCallback, useRef, useReducer } from "react";
const Context = createContext(void 0);
const Provider = Context.Provider;
const Consumer = Context.Consumer;
Context.displayName = "SupabaseContext";
function useClient() {
  const client = useContext(Context);
  if (client === void 0)
    throw Error("No client has been specified using Provider.");
  return client;
}
function useAuthStateChange(callback) {
  const client = useClient();
  useEffect(() => {
    const { data: authListener } = client.auth.onAuthStateChange(callback);
    return () => {
      authListener == null ? void 0 : authListener.unsubscribe();
    };
  }, []);
}
const initialState$3 = {
  error: void 0,
  fetching: false
};
function useResetPassword(config = {}) {
  const client = useClient();
  const [state, setState] = useState(initialState$3);
  const execute = useCallback(async (email, options) => {
    setState(__spreadProps(__spreadValues({}, initialState$3), { fetching: true }));
    const { error } = await client.auth.api.resetPasswordForEmail(email, options != null ? options : config.options);
    const res = { error };
    setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client, config]);
  return [state, execute];
}
const initialState$2 = {
  error: void 0,
  fetching: false,
  session: void 0,
  user: void 0
};
function useSignIn(config = {}) {
  const client = useClient();
  const [state, setState] = useState(initialState$2);
  const execute = useCallback(async (credentials, options) => {
    setState(__spreadProps(__spreadValues({}, initialState$2), { fetching: true }));
    const { error, session, user } = await client.auth.signIn(__spreadValues({
      provider: config.provider
    }, credentials), options != null ? options : config.options);
    const res = { error, session, user };
    setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client, config]);
  return [state, execute];
}
const initialState$1 = {
  error: void 0,
  fetching: false
};
function useSignOut() {
  const client = useClient();
  const [state, setState] = useState(initialState$1);
  const execute = useCallback(async () => {
    setState(__spreadProps(__spreadValues({}, initialState$1), { fetching: true }));
    const { error } = await client.auth.signOut();
    const res = { error };
    setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client]);
  return [state, execute];
}
function useSignUp(config = {}) {
  const client = useClient();
  const [state, setState] = useState(initialState$2);
  const execute = useCallback(async (credentials, options) => {
    setState(__spreadProps(__spreadValues({}, initialState$2), { fetching: true }));
    const { error, session, user } = await client.auth.signUp(credentials, options != null ? options : config.options);
    const res = { error, session, user };
    setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client, config]);
  return [state, execute];
}
const initialState = {
  count: void 0,
  data: void 0,
  error: void 0,
  fetching: false
};
function useDelete(table, config = { options: {} }) {
  const client = useClient();
  const isMounted = useRef(false);
  const [state, setState] = useState(initialState);
  const execute = useCallback(async (filter, options) => {
    const refine = filter != null ? filter : config.filter;
    if (refine === void 0)
      throw Error("delete() should always be combined with `filter`");
    setState(__spreadProps(__spreadValues({}, initialState), { fetching: true }));
    const source = client.from(table).delete(options != null ? options : config.options);
    const { count, data, error } = await refine(source);
    const res = { count, data, error };
    if (isMounted.current)
      setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client]);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return [state, execute];
}
function useFilter(filter, deps = []) {
  const callback = useCallback(filter, deps);
  return callback;
}
function useInsert(table, config = { options: {} }) {
  const client = useClient();
  const isMounted = useRef(false);
  const [state, setState] = useState(initialState);
  const execute = useCallback(async (values, options) => {
    setState(__spreadProps(__spreadValues({}, initialState), { fetching: true }));
    const { count, data, error } = await client.from(table).insert(values, options != null ? options : config.options);
    const res = { count, data, error };
    if (isMounted.current)
      setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client]);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return [state, execute];
}
function useSelect(table, config = { columns: "*", options: {} }) {
  const client = useClient();
  const isMounted = useRef(false);
  const [state, setState] = useState(__spreadProps(__spreadValues({}, initialState), {
    stale: false
  }));
  const execute = useCallback(async () => {
    if (config.pause)
      return null;
    setState((x) => __spreadProps(__spreadValues({}, initialState), {
      data: x.data,
      stale: true,
      fetching: true
    }));
    const source = client.from(table).select(config.columns, config.options);
    const { count, data, error } = await (config.filter ? config.filter(source) : source);
    const res = { count, data, error };
    if (isMounted.current)
      setState(__spreadProps(__spreadValues({}, res), { stale: false, fetching: false }));
    return res;
  }, [client, config, table]);
  useEffect(() => {
    isMounted.current = true;
    execute();
    return () => {
      isMounted.current = false;
    };
  }, [config == null ? void 0 : config.filter]);
  return [state, execute];
}
function useUpdate(table, config = { options: {} }) {
  const client = useClient();
  const isMounted = useRef(false);
  const [state, setState] = useState(initialState);
  const execute = useCallback(async (values, filter, options) => {
    const refine = filter != null ? filter : config.filter;
    if (refine === void 0)
      throw Error("update() should always be combined with `filter`");
    setState(__spreadProps(__spreadValues({}, initialState), { fetching: true }));
    const source = client.from(table).update(values, options != null ? options : config.options);
    const { count, data, error } = await refine(source);
    const res = { count, data, error };
    if (isMounted.current)
      setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client]);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return [state, execute];
}
function useUpsert(table, config = { options: {} }) {
  const client = useClient();
  const isMounted = useRef(false);
  const [state, setState] = useState(initialState);
  const execute = useCallback(async (values, options, filter) => {
    const refine = filter != null ? filter : config.filter;
    setState(__spreadProps(__spreadValues({}, initialState), { fetching: true }));
    const source = client.from(table).upsert(values, options != null ? options : config.options);
    const { count, data, error } = await (refine ? refine(source) : source);
    const res = { count, data, error };
    if (isMounted.current)
      setState(__spreadProps(__spreadValues({}, res), { fetching: false }));
    return res;
  }, [client]);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return [state, execute];
}
function useSubscription(callback, config = { event: "*", table: "*" }) {
  const client = useClient();
  useEffect(() => {
    var _a, _b;
    const subscription = client.from((_a = config.table) != null ? _a : "*").on((_b = config.event) != null ? _b : "*", callback).subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, []);
}
function useRealtime(table, config, compareFn = (a, b) => a.id === b.id) {
  if (table === "*")
    throw Error("Must specify table or row. Cannot listen for all database changes.");
  const [result, reexecute] = useSelect(table, config == null ? void 0 : config.select);
  const [state, dispatch] = useReducer(reducer(compareFn), result);
  useSubscription((payload) => dispatch({ type: "SUBSCRIPTION", payload }), {
    table
  });
  useEffect(() => {
    dispatch({ type: "FETCH", payload: result });
  }, [result]);
  return [state, reexecute];
}
const reducer = (compareFn) => (state, action) => {
  var _a;
  const old = state.data;
  switch (action.type) {
    case "FETCH":
      return __spreadValues(__spreadProps(__spreadValues({}, state), { old }), action.payload);
    case "SUBSCRIPTION":
      switch (action.payload.eventType) {
        case "DELETE":
          return __spreadProps(__spreadValues({}, state), {
            data: (_a = state.data) == null ? void 0 : _a.filter((x) => !compareFn(x, action.payload.old)),
            fetching: false,
            old
          });
        case "INSERT":
          return __spreadProps(__spreadValues({}, state), {
            data: [...old != null ? old : [], action.payload.new],
            fetching: false,
            old
          });
        case "UPDATE": {
          const data = old != null ? old : [];
          const index = data.findIndex((x) => compareFn(x, action.payload.new));
          return __spreadProps(__spreadValues({}, state), {
            data: [
              ...data.slice(0, index),
              action.payload.new,
              ...data.slice(index + 1)
            ],
            fetching: false,
            old
          });
        }
      }
  }
};
export { Consumer, Context, Provider, useAuthStateChange, useClient, useDelete, useFilter, useInsert, useRealtime, useResetPassword, useSelect, useSignIn, useSignOut, useSignUp, useSubscription, useUpdate, useUpsert };
