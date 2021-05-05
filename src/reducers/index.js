import { combineReducers } from 'redux'
import GalleryReducer from "./Gallery"
import GalleryDetailReducer from "./GalleryDetail"
import PackageReducer from "./PurchasePass"
import MerchandiseReducer from "./Merchandise"
import MerchandiseDetailReducer from "./MerchandiseDetail"
import FAQReducer from "./Help"
import AccountReducer from "./Account"
import AlbumsReducer from "./Albums"
import PrivacyReducer from "./Privacy"

export default combineReducers({
  gallery: GalleryReducer,
  galleryDetail: GalleryDetailReducer,
  package: PackageReducer,
  merchandise: MerchandiseReducer,
  merchandiseDetail: MerchandiseDetailReducer,
  help: FAQReducer,
  account: AccountReducer,
  albums: AlbumsReducer,
  privacy: PrivacyReducer,
})