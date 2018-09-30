import { isFSA } from 'flux-standard-action';
 
const initialState = {
    authState: 'unauthenticated'
};
 
const reducer = (state = initialState, action) => {
    if (!isFSA(action))
        return state;
 
    const payload = action.payload || {};
    switch (action.type) {
        case '@auth:set':
            if ('state' in payload) {
                return Object.assign({}, state, { authState: payload.state });
            } else {
                console.warn(`@auth:set: called without state in payload`);
                return state;
            }
    }
 
    // If it didn't match one of the known types, then just return the state
    return state;
};
 
export default reducer;