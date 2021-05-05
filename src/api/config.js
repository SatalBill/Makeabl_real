export const BASE_PATH = 'https://makeablmoments.com'
// export const BASE_PATH = 'http://192.168.1.2/makeabl'
export const GALLERY_PATH = '/uploads/gallery/'
export const PACKAGE_PATH = '/uploads/package/'
export const MERCHANDISE_PATH = '/uploads/souvenirs/'
export const FACE_REGISTER_PATH = 'https://mymakeabl.com'
// export const IMAGE_UPLOAD_PATH = 'http://192.168.1.23:8000'
// export const amazon = 'https://makeabl-data.s3-ap-southeast-1.amazonaws.com/'
export const amazon = 'http://d1z6a3vjnfowyr.cloudfront.net/'
export default {
  auth: {
    login: BASE_PATH + '/api/auth/login',
    register: BASE_PATH + '/api/auth/register',
    forgotpwd: BASE_PATH + '/api/auth/forgotpwd',
    resetpwd: BASE_PATH + '/api/auth/resetpwd',
    verify: BASE_PATH + '/api/auth/verify',
    resend: BASE_PATH + '/api/auth/resend',
    signout: BASE_PATH + '/api/auth/signout',
    faceregister: FACE_REGISTER_PATH + '/api/faceregister',
    getCountry: BASE_PATH + '/api/country',
    getSite: BASE_PATH + '/api/site',
    getPrivacy: BASE_PATH + '/api/privacy',
    getTerms: BASE_PATH + '/api/terms',
    token: BASE_PATH + '/api/auth/token',
  },
  api: {
    //gallery
    getGalleryInfo: BASE_PATH + '/api/gallery',
    getVideoInfo: BASE_PATH + '/api/gallery/video',
    getAlbumInfo: BASE_PATH + '/api/album',
    getCountry: BASE_PATH + '/api/gallery/country',
    getSite: BASE_PATH + '/api/gallery/site',
    postMarkHeart: BASE_PATH + '/api/gallery/favorite',
    guestImageUpload: FACE_REGISTER_PATH + '/api/guest_upload_image',
    
    //albums
    // getAlbumsInfo: BASE_PATH + '/api/albums',  // no need.

    //gallery detail
    guestImageProcess: FACE_REGISTER_PATH + '/api/process_merge',
    getOverlayInfo: BASE_PATH + '/api/overlay',
    getFrameInfo: BASE_PATH + '/api/frame',
    getActiveState: BASE_PATH + '/api/gdetail/activeState',
    
    //video detail
    getPositionInfo: BASE_PATH + '/api/gallery/vdetail',
    guestVideoProcess: FACE_REGISTER_PATH + '/api/zoomvideo_process',

    //package
    getPackageInfo: BASE_PATH + '/api/package',
    getPackageCountry: BASE_PATH + '/api/package/country',
    getPackageSite: BASE_PATH + '/api/package/site',
    checkPackage: BASE_PATH + '/api/package/check',
    packageBuy: BASE_PATH + '/api/package/buy',
    prePackage: BASE_PATH + '/api/account/scanprepackage',

    //FAQ
    getFAQ: BASE_PATH + '/api/faq',

    //Merchandise
    getMerchandiseInfo: BASE_PATH + '/api/merchandise',
    getMerchandiseCountry: BASE_PATH + '/api/merchandise/country',
    getMerchandiseSite: BASE_PATH + '/api/merchandise/site',
    
    //Merchandise Detail
    getAlbumBySite: BASE_PATH + '/api/merchandise/album',
    getMerchandiseSize: BASE_PATH + '/api/merchandise/size',
    checkCartSite: BASE_PATH + '/api/merchandise/checkCartSite',
    
    //account
    update: BASE_PATH + '/api/account/update',
    removeSite: BASE_PATH + '/api/account/site/delete',
    addSite: BASE_PATH + '/api/account/site/add',
    validationSite: BASE_PATH + '/api/account/site/validation',
    getPackageHistory: BASE_PATH + '/api/account/package',
    getOrderHistory: BASE_PATH + '/api/account/order',
    getSiteList: BASE_PATH + '/api/account/site',
    refund: BASE_PATH + '/api/account/refundPackage',
    refundOrder: BASE_PATH + '/api/account/refundOrder',
    getOrderdetail: BASE_PATH + '/api/account/orderdetail',
    getQRdetail: BASE_PATH + '/api/account/prepackage',
    
    //Cart
    addCart: BASE_PATH + '/api/cart/add',
    getCart: BASE_PATH + '/api/cart',
    delCart: BASE_PATH + '/api/cart/delete',
    amountCart: BASE_PATH + '/api/cart/amount',
    getAlbumOnModal: BASE_PATH + '/api/cart/album',
    
    //Checkout
    orderAdd: BASE_PATH + '/api/order/add',
    
  }
}
