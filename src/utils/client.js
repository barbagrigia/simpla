import fetch from './fetch';

/**
 * Check Status and request courtesy of feathers-rest
 * See https://github.com/feathersjs/feathers-rest/blob/master/src/client/fetch.js
 */
function checkStatus(response) {
  let rejectAsError;

  if (response.ok) {
    return response;
  }

  rejectAsError = (body = {}) => {
    let code = body.code || response.status,
        statusText = body.statusText || response.statusText,
        error = new Error(statusText);

    error.code = code;
    error.statusText = statusText;

    return Promise.reject(error);
  }

  return Promise.resolve()
    .then(() => response.json())
    .then(
      (body) => rejectAsError(body),
      () => rejectAsError({ code: response.status, statusText: response.statusText })
    );
}

function request(options) {
  let fetchOptions = Object.assign({}, options);

  fetchOptions.headers = Object.assign({
    Accept: 'application/json',
  }, fetchOptions.headers);

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    fetchOptions.headers = Object.assign({
      'Content-Type': 'application/json'
    }, fetchOptions.headers);
  }

  return fetch(options.url, fetchOptions)
      .then(checkStatus)
      .then(response => response.status === 204 ? null : response.json());
}

function requestWithToken(options) {
  let token = options.token;

  if (token) {
    options.headers = Object.assign({
      'Authorization': `Bearer ${token}`
    }, options.headers);
  }

  return request(options);
}

export default {
  get(url, options) {
    return request(Object.assign({ method: 'GET' }, options, { url }));
  },

  post(url, options) {
    return requestWithToken(Object.assign({ method: 'POST' }, options, { url }));
  },

  put(url, options) {
    return requestWithToken(Object.assign({ method: 'PUT' }, options, { url }));
  },

  delete(url, options) {
    return requestWithToken(Object.assign({ method: 'DELETE' }, options, { url }));
  }
}