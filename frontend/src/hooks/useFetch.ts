import axios from "axios";
import { Reducer, useCallback, useReducer, useRef } from "react";

export type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
};

type FetchAction<T> =
  | {
      type: "reqStart";
    }
  | { type: "reqSuccess"; data: T }
  | { type: "reqError"; error: Error | null };

const createInitialState = <T>(): FetchState<T> => {
  return { data: null, loading: false, error: null };
};

const reducer = <T>(
  state: FetchState<T>,
  action: FetchAction<T>
): FetchState<T> => {
  switch (action.type) {
    case "reqStart":
      return { ...state, loading: true };
    case "reqError":
      return { data: null, loading: false, error: action.error };
    case "reqSuccess":
      return { data: action.data, loading: false, error: null };
    default:
      return state;
  }
};

const useFetch = <T>(url: string) => {
  const [fetchState, dispatch] = useReducer<
    Reducer<FetchState<T>, FetchAction<T>>
  >(reducer, createInitialState());
  const latestRequestId = useRef(0);

  const callRequest = useCallback(async (overrideUrl?: string) => {
    const requestId = ++latestRequestId.current;
    const requestUrl = overrideUrl ?? url;
    try {
      dispatch({ type: "reqStart" });
      const res = await axios.get<T>(requestUrl);
      const data = await res.data;
      if (requestId !== latestRequestId.current) return;
      dispatch({type: "reqSuccess", data});
    } catch (e) {
      if (requestId !== latestRequestId.current) return;
      if (axios.isAxiosError(e)) {
        typeof e.response?.data === "string"
          ? dispatch({ type: "reqError", error: new Error(e.response.data) })
          : dispatch({ type: "reqError", error: new Error(e.message) });
      } else {
        dispatch({ type: "reqError", error: new Error("an error occurred") });
      }
    }
  }, [url]);

  return { fetchState, callRequest };
};

export default useFetch;
