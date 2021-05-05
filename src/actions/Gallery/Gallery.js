import GalleryApi from '../../api/GalleryApi';
import { GALLERYINFO, COUNTRY, SITE, ALBUMINFO } from '../type'

export const GalleryInfoFunc = (galleryInfo) => ({
    type: GALLERYINFO,
    payload: galleryInfo
})

export const AlbumInfoFunc = (albumInfo) => ({
    type: ALBUMINFO,
    payload: albumInfo
})

export const CountryFunc = (country) => ({
    type: COUNTRY,
    payload: country
})

export const SiteFunc = (site) => ({
    type: SITE,
    payload: site
})

// export const markHeartFunc = (markHeart) => ({
//     type: MARKHEART,
//     payload: markHeart
// }) 


export const FetchGalleryInfo = (country_id, site_id) => (
    (dispatch) => {
        GalleryApi.getGalleryInfo((response) => {
            // console.log('actions->GalleryResponse', response['data']['gallery_list'])
            dispatch(GalleryInfoFunc(response['data']['gallery_list']))
        }, (err) => {
            console.log(err)
        }, country_id, site_id)
    }
)

export const FetchAlbum = (uploadType_id, favorite_id) => (
    (dispatch) => {
        GalleryApi.getAlbumInfo((response) => {
            // console.log('actions->AlbumResponse', response['data']['album_list'])
            dispatch(AlbumInfoFunc(response['data']['album_list']))
        }, (err) => {
            console.log(err)
        }, uploadType_id, favorite_id)
    }
)

export const FetchCountry = () => (
    (dispatch) => {
        GalleryApi.getCountry((response) => {
            // console.log('actions->response_country', response['data']['country_list'])
            dispatch(CountryFunc(response['data']['country_list']))
        }, (err) => {
            console.log(err)
        })
    }
)

export const FetchSite = (country_id) => (
    (dispatch) => {
        GalleryApi.getSite((response) => {
            // console.log('actions->response_site', response['data']['site_list'])
            dispatch(SiteFunc(response['data']['site_list']))
        }, (err) => {
            console.log(err)
        }, country_id)
    }
)

// export const FetchMarkHeart = (photoID, heartStatus) => (
//     (dispatch) => {
//         GalleryApi.getMarkHeart((response) => {
//             console.log("markHeartData=>", response['data']['gallery_list'])
//             dispatch(markHeartFunc(response['data']['gallery_list']))
//         }, (err) => {
//             // console.log(err, alert(err, 'GalleryError'))
//             console.log(err)
//         }, photoID, heartStatus)
//     }
// )