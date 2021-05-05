import MerchandiseApi from '../../api/MerchandiseApi';
import { MERCHANDISEINFO, MERCHANDISE_COUNTRY, MERCHANDISE_SITE } from '../type'

export const MerchandiseInfoFunc = (MerchandiseInfo) => ({
    type: MERCHANDISEINFO,
    payload: MerchandiseInfo
})

export const MerchandiseCountryFunc = (MerchandiseCountry) => ({
    type: MERCHANDISE_COUNTRY,
    payload: MerchandiseCountry
})

export const MerchandiseSiteFunc = (MerchandiseSite) => ({
    type: MERCHANDISE_SITE,
    payload: MerchandiseSite
})

export const FetchMerchandiseInfo = (country_id, site_id) => (
    (dispatch) => {
        MerchandiseApi.getMerchandiseInfo((response) => {
            console.log('actions->response_MerchandiseInfo', response['data']['merchandise_list'])
            dispatch(MerchandiseInfoFunc(response['data']['merchandise_list']))
        }, (err) => {
            console.log(err)
        }, country_id, site_id)
    }
)

export const FetchMerchandiseCountry = () => (
    (dispatch) => {
        MerchandiseApi.getMerchandiseCountry((response) => {
            console.log('actions->response_MerchandiseCountry', response['data']['country_list'])
            dispatch(MerchandiseCountryFunc(response['data']['country_list']))
        }, (err) => {
            console.log(err)
        })
    }
)

export const FetchMerchandiseSite = (MerchandiseCountry_id) => (
    (dispatch) => {
        MerchandiseApi.getMerchandiseSite((response) => {
            console.log('actions->response_MerchandiseSite', response['data']['site_list'])
            dispatch(MerchandiseSiteFunc(response['data']['site_list']))
        }, (err) => {
            console.log(err)
        }, MerchandiseCountry_id)
    }
)
