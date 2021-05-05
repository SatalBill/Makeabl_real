import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {

    getAlbumBySite(callback, fail, site_id) {
        apiCall.makeGetRequest(config.api.getAlbumBySite + '/' + site_id, callback, fail);
    },

}
