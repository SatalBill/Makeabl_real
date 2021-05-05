import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {

    getMerchandiseInfo(callback, fail, country_id, site_id) {
        apiCall.makeGetRequest(config.api.getMerchandiseInfo + '/' + country_id + '/' + site_id, callback, fail);
    },

    getMerchandiseCountry(callback, fail) {
        apiCall.makeGetRequest(config.api.getMerchandiseCountry, callback, fail);
    },

    getMerchandiseSite(callback, fail, MerchandiseCountry_id) {
        apiCall.makeGetRequest(config.api.getMerchandiseSite + '/' + MerchandiseCountry_id, callback, fail);
    },

}
