import { registerUserAsync } from "./userService.js";

export const subscribeEvents = async (payload) => {
  // parse data
  payload = JSON.parse(data.content.toString());

  const { event, data } = payload;

  // manage event
  switch (event) {
    case "REGISTER_USER":
      await registerUserAsync(data)
      return 
    default:
      break;
  }
};
