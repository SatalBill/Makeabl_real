import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {

    getPackageHistory(callback, fail) {
        apiCall.makeGetRequest(config.api.getPackageHistory, callback, fail);
    },

    getSiteList(callback, fail) {
        apiCall.makeGetRequest(config.api.getSiteList, callback, fail);
    },

    // getSite(callback, fail, country_id) {
    //     apiCall.makeGetRequest(config.api.getSite + '/' + country_id, callback, fail);
    // },

}
