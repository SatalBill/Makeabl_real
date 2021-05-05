export default function (state = {}, action) {
  switch (action.type) {
    case "GALLERYINFO":
      return {
        ...state,
        galleryInfo: action.payload,
      };
    case "COUNTRY":
      return {
        ...state,
        country: action.payload,
      };
    case "SITE":
      return {
        ...state,
        site: action.payload,
      };
    default:
      return state;
  }
}
