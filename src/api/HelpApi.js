import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {
  getFAQ(callback, fail) {
    apiCall.makeGetRequest(config.api.getFAQ, callback, fail);
  },
  getPrivacy(callback, fail) {
    apiCall.makeGetRequest(config.auth.getPrivacy, callback, fail);
  },
}
