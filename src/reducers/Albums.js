export default function (state = {}, action) {
  switch (action.type) {
    case "ALBUMINFO":
      return {
        ...state,
        albumInfo: action.payload,
      };
    default:
      return state;
  }
}
