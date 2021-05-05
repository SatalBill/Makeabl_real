export default function (state = {}, action) {
  switch (action.type) {
    case "FAQS":
      return {
        ...state,
        faqs: action.payload,
      };
    default:
      return state;
  }
}
