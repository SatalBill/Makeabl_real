export default function (state = {}, action) {
  switch (action.type) {
    case "MERCHANDISEINFO":
      return {
        ...state,
        merchandiseInfo: action.payload,
      };
    case "MERCHANDISE_COUNTRY":
      return {
        ...state,
        merchandiseCountry: action.payload,
      };
    case "MERCHANDISE_SITE":
      return {
        ...state,
        merchandiseSite: action.payload,
      };
    default:
      return state;
  }
}
