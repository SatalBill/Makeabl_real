import MerchandiseDetailApi from '../../api/MerchandiseDetailApi';
import { ALBUM_BY_SITE } from '../type'

export const AlbumBySiteFunc = (albumBySite) => ({
    type: ALBUM_BY_SITE,
    payload: albumBySite
})

export const FetchAlbumBySite = (site_id) => (
    (dispatch) => {
        MerchandiseDetailApi.getAlbumBySite((response) => {
            console.log('actions->AlbumBySite:', response['data']['album_list'])
            dispatch(AlbumBySiteFunc(response['data']['album_list']))
        }, (err) => {
            console.log(err)
        }, site_id)
    }
)
