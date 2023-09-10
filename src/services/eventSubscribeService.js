import { getUserByIdAsync } from "./userService.js";

export const subscribeEvents = (payload) => {
  // parse data
  payload = JSON.parse(data.content.toString());

  const { event, data } = payload;

  // manage event
  switch (event) {
    case "DELETE_USER_BY_ID":
      break;
    default:
      break;
  }
};
