export default function (state = {}, action) {
  switch (action.type) {
    case "PACKAGE_HISTORY":
      return {
        ...state,
        packageHistory: action.payload,
      };
    case "SITELIST":
      return {
        ...state,
        siteList: action.payload,
      };
    default:
      return state;
  }
}
