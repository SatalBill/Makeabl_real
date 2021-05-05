import AlbumsApi from '../../api/AlbumsApi';
import { ALBUMSINFO } from '../type'

export const AlbumsInfoFunc = (albumsInfo) => ({
    type: ALBUMSINFO,
    payload: albumsInfo
})

export const FetchAlbumsInfo = () => (
    (dispatch) => {
        AlbumsApi.getAlbumsInfo((response) => {
            console.log('actions->albumsInfo:', response['data'])
            dispatch(AlbumsInfoFunc(response['data']))
        }, (err) => {
            console.log(err)
        })
    }
)
