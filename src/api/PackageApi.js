import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {
    // getAllAlbums(callback, fail, genreID, artistID, albumID) {
    //     apiCall.makeGetRequest(config.api.getAllAlbums + '/' + genreID.toString() + '/' + artistID.toString() + '/' + albumID.toString(), callback, fail);
    // },

    getPackageInfo(callback, fail, country_id, site_id) {
        apiCall.makeGetRequest(config.api.getPackageInfo + '/' + country_id + '/' + site_id, callback, fail);
    },

    getPackageCountry(callback, fail) {
        apiCall.makeGetRequest(config.api.getPackageCountry, callback, fail);
    },

    getPackageSite(callback, fail, packageCountry_id) {
        apiCall.makeGetRequest(config.api.getPackageSite + '/' + packageCountry_id, callback, fail);
    },

    // getMarkHeart(callback, fail, photoID, heartStatus) {
    //     apiCall.makeGetRequest(config.api.getMarkHeart + '/' + photoID + '/' + heartStatus, callback, fail);
    // },

}
