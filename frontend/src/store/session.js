import { csrfFetch } from './csrf.js';

const SET_USER = 'session/setUser';
// const SET_USER_ERRORS = 'session/setUser/errors'
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => ({
  type: SET_USER,
  payload: user
});

const removeUser = () => ({
  type: REMOVE_USER
});

// const setUserErrors = (userErrs) => ({
//   type: SET_USER_ERRORS,
//   payload: userErrs
// })

export const login = ({ credential, password }) => async dispatch => {
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ credential, password })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const restoreUser = () => async dispatch => {
  const response = await csrfFetch("/api/session");
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
};

export const signup = (user) => async (dispatch) => {
  const { username, firstName, lastName, email, password } = user;
  // try{
  const response = await csrfFetch("/api/users", {
    method: "POST",
    body: JSON.stringify({
      username,
      firstName,
      lastName,
      email,
      password
    })
  });
  const data = await response.json();
  console.log("DATA: ",data)
  dispatch(setUser(data.user));
  return data;
// } catch (e) {
// let err = await e.json()
// console.log("ERR",err)
// dispatch(setUserErrors(err))
// }
};

export const logout = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "DELETE"
  });
  dispatch(removeUser());
  return response;
};

export const defaultLogin = () => async (dispatch) => {
  const response = await csrfFetch("/api/session", {
    method: "POST",
    body: JSON.stringify({ credential: 'demo@user.io', password: 'password' })
  });
  const data = await response.json();
  dispatch(setUser(data.user));
  return response;
}

const initialState = { user: null };

function sessionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.payload };
    case REMOVE_USER:
      return { ...state, user: null };
    // case SET_USER_ERRORS:
    //   return { ...state, userErrs: action.payload}
    default:
      return state;
  }
}

export default sessionReducer;
