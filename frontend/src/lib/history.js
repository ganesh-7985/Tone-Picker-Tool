export function createHistory(initialText = '') {
    return { history: [], future: [], current: initialText };
}
export function push(state, nextText) {
    return { history: [...state.history, state.current], future: [], current: nextText };
}
export function undo(state) {
    if (state.history.length === 0) return state;
    const prev = state.history[state.history.length - 1];
    return { history: state.history.slice(0, -1), future: [state.current, ...state.future], current: prev };
}
export function redo(state) {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return { history: [...state.history, state.current], future: state.future.slice(1), current: next };
}
export function resetTo(state, text) { return { history: [], future: [], current: text }; }
