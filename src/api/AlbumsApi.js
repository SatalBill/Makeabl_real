import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {
    getAlbumsInfo(callback, fail) {
        apiCall.makeGetRequest(config.api.getAlbumsInfo, callback, fail);
    },
}
