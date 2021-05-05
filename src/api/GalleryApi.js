import config from './config';
import apiCall from './apiUtils/makeApiCall'

export default {
    // getAllAlbums(callback, fail, genreID, artistID, albumID) {
    //     apiCall.makeGetRequest(config.api.getAllAlbums + '/' + genreID.toString() + '/' + artistID.toString() + '/' + albumID.toString(), callback, fail);
    // },

    getGalleryInfo(callback, fail, country_id, site_id) {
        console.log(country_id, site_id);
        apiCall.makeGetRequest(config.api.getGalleryInfo + '/' + country_id + '/' + site_id, callback, fail);
    },

    getAlbumInfo(callback, fail, uploadType_id, favorite_id) {
        console.log(uploadType_id, favorite_id);
        apiCall.makeGetRequest(config.api.getAlbumInfo + '/' + uploadType_id + '/' + favorite_id, callback, fail);
    },

    getCountry(callback, fail) {
        apiCall.makeGetRequest(config.api.getCountry, callback, fail);
    },

    getSite(callback, fail, country_id) {
        apiCall.makeGetRequest(config.api.getSite + '/' + country_id, callback, fail);
    },

    getOverlayInfo(callback, fail, site_id) {
        apiCall.makeGetRequest(config.api.getOverlayInfo + '/' + site_id, callback, fail);
    },

    getFrameInfo(callback, fail, site_id) {
        apiCall.makeGetRequest(config.api.getFrameInfo + '/' + site_id, callback, fail);
    },



}
