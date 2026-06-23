export interface FenceState {
  inFenced: boolean;
  fenceChar: string;
  fenceLen: number;
}

export const INITIAL_FENCE_STATE: FenceState = {
  inFenced: false,
  fenceChar: '',
  fenceLen: 0,
};

export const updateFenceStateForLine = (
  state: FenceState,
  line: string,
): FenceState => {
  const trimmed = line.trimStart();
  const match = trimmed.match(/^(`{3,}|~{3,})(.*)$/);
  if (!match) return state;

  const char = match[1][0];
  const len = match[1].length;
  const after = match[2];

  if (!state.inFenced) {
    return { inFenced: true, fenceChar: char, fenceLen: len };
  }

  if (
    char === state.fenceChar &&
    len >= state.fenceLen &&
    /^\s*$/.test(after)
  ) {
    return { inFenced: false, fenceChar: '', fenceLen: 0 };
  }

  return state;
};

/** 流式末块是否落在未闭合的围栏代码块内（需每帧重 parse 以更新 code 内容） */
export const endsInsideUnclosedFence = (content: string): boolean => {
  let state = { ...INITIAL_FENCE_STATE };
  for (const line of content.split('\n')) {
    state = updateFenceStateForLine(state, line);
  }
  return state.inFenced;
};
