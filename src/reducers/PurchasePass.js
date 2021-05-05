export default function (state = {}, action) {
  switch (action.type) {
    case "PACKAGEINFO":
      return {
        ...state,
        packageInfo: action.payload,
      };
    case "PACKAGE_COUNTRY":
      return {
        ...state,
        packageCountry: action.payload,
      };
    case "PACKAGE_SITE":
      return {
        ...state,
        packageSite: action.payload,
      };
    default:
      return state;
  }
}
