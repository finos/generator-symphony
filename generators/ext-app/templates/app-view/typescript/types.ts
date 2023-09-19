export type RemoteApi = {
  getContext: () => Promise<unknown>,
  setContext: (c : unknown) => void,
};
