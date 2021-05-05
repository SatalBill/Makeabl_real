import GalleryApi from '../../api/GalleryApi';
import { OVERLAYINFO, FRAMEINFO } from '../type'

export const OverlayFunc = (overlayInfo) => ({
  type: OVERLAYINFO,
  payload: overlayInfo
})

export const FrameFunc = (frameInfo) => ({
  type: FRAMEINFO,
  payload: frameInfo
})

export const FetchOverlay = (site_id) => (
  (dispatch) => {
    GalleryApi.getOverlayInfo((response) => {
      // console.log('actions->OverlayResponse', response['data'])  
      dispatch(OverlayFunc(response['data']))
    }, (err) => {
      console.log(err)
    }, site_id)
  }
)

export const FetchFrame = (site_id) => (
  (dispatch) => {
    GalleryApi.getFrameInfo((response) => {
      // console.log('actions->FrameResponse', response['data'])  
      dispatch(FrameFunc(response['data']))
    }, (err) => {
      console.log(err)
    }, site_id)
  }
)
