export default function (state = {}, action) {
  switch (action.type) {
    case "OVERLAYINFO":
      return {
        ...state,
        overlayInfo: action.payload,
      };
    case "FRAMEINFO":
      return {
        ...state,
        frameInfo: action.payload,
      };
    default:
      return state;
  }
}
