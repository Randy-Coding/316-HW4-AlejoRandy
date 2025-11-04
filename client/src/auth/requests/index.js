/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/auth';

const handleResponse = async (res) => {
  const raw = await res.text();
  let data = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && (data.errorMessage || data.message)) ||
      (typeof data === 'string' ? `HTTP ${res.status}: ${data}` : `HTTP ${res.status}`);

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    err.response = { status: res.status, data }; 
    throw err;
  }

  return { status: res.status, data };
};
const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`, { method: 'GET', credentials: 'include' })
      .then(handleResponse),

  post: (path, data) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then(handleResponse),

  put: (path, data) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(handleResponse),
};
// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const getLoggedIn = () => api.get(`/loggedIn/`);
export const loginUser = (email, password) => {
    return api.post(`/login/`, {
        email : email,
        password : password
    })
}
export const logoutUser = () => api.get(`/logout/`)
export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
    return api.post(`/register/`, {
        firstName : firstName,
        lastName : lastName,
        email : email,
        password : password,
        passwordVerify : passwordVerify
    })
}
const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis
