import HelpApi from '../../api/HelpApi';
import { PRIVACY } from '../type'

export const PrivacyFunc = (privacy) => ({
  type: PRIVACY,
  payload: privacy
})

export const FetchPrivacy = () => (
  (dispatch) => {
    HelpApi.getPrivacy((response) => {
      console.log('actions->response_Privacy', response)
      dispatch(PrivacyFunc(response))
    }, (err) => {
      console.log(err)
    })
  }
)
