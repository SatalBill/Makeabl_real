import AccountApi from '../../api/AccountApi';
import { PACKAGE_HISTORY, SITELIST } from '../type'

export const PackageHistoryFunc = (packageHistory) => ({
    type: PACKAGE_HISTORY,
    payload: packageHistory
})

export const SiteListFunc = (siteList) => ({
    type: SITELIST,
    payload: siteList
})

export const FetchPackageHistory = () => (
    (dispatch) => {
        AccountApi.getPackageHistory((response) => {
            // console.log('actions->packageHistory:', response['data'])
            dispatch(PackageHistoryFunc(response['data']))
        }, (err) => {
            console.log(err)
        })
    }
)

export const FetchSiteList = () => (
    (dispatch) => {
        AccountApi.getSiteList((response) => {
            console.log('actions->SiteList:', response['data']['site_list'])
            dispatch(SiteListFunc(response['data']['site_list']))
        }, (err) => {
            console.log(err)
        })
    }
)
