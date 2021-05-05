export default function (state = {}, action) {
  switch (action.type) {
    case "PRIVACY":
      return {
        ...state,
        privacy: action.payload,
      };
    default:
      return state;
  }
}
