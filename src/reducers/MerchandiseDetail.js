export default function (state = {}, action) {
  switch (action.type) {
    case "ALBUM_BY_SITE":
      return {
        ...state,
        albumBySite: action.payload,
      };
    default:
      return state;
  }
}
