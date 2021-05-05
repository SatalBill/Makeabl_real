import PackageApi from '../../api/PackageApi';
import { PACKAGEINFO, PACKAGE_COUNTRY, PACKAGE_SITE } from '../type'

export const PackageInfoFunc = (packageInfo) => ({
    type: PACKAGEINFO,
    payload: packageInfo
})

export const PackageCountryFunc = (packageCountry) => ({
    type: PACKAGE_COUNTRY,
    payload: packageCountry
})

export const PackageSiteFunc = (packageSite) => ({
    type: PACKAGE_SITE,
    payload: packageSite
})

// export const markHeartFunc = (markHeart) => ({
//     type: MARKHEART,
//     payload: markHeart
// }) 


export const FetchPackageInfo = (country_id, site_id) => (
    (dispatch) => {
        PackageApi.getPackageInfo((response) => {
            console.log('actions->response_packageInfo', response['data']['package_list'])
            dispatch(PackageInfoFunc(response['data']['package_list']))
        }, (err) => {
            console.log(err)
        }, country_id, site_id)
    }
)

export const FetchPackageCountry = () => (
    (dispatch) => {
        PackageApi.getPackageCountry((response) => {
            console.log('actions->response_packageCountry', response['data']['country_list'])
            dispatch(PackageCountryFunc(response['data']['country_list']))
        }, (err) => {
            console.log(err)
        })
    }
)

export const FetchPackageSite = (packageCountry_id) => (
    (dispatch) => {
        PackageApi.getPackageSite((response) => {
            console.log('actions->response_packageSite', response['data']['site_list'])
            dispatch(PackageSiteFunc(response['data']['site_list']))
        }, (err) => {
            console.log(err)
        }, packageCountry_id)
    }
)

// export const FetchMarkHeart = (photoID, heartStatus) => (
//     (dispatch) => {
//         PackageApi.getMarkHeart((response) => {
//             console.log("markHeartData=>", response['data']['package_list'])
//             dispatch(markHeartFunc(response['data']['package_list']))
//         }, (err) => {
//             // console.log(err, alert(err, 'GalleryError'))
//             console.log(err)
//         }, photoID, heartStatus)
//     }
// )