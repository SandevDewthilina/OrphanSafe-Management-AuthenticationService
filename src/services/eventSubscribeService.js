import { registerUserAsync,updateUserAsync } from "./userService.js";

export const subscribeEvents = async (payload) => {
  const { event, data } = payload;

  // manage event
  switch (event) {
    case "REGISTER_USER":
      try {
        return await registerUserAsync(data);
      } catch (e) {
        return e.message;
      }
    case "UPDATE_USER":
        try {
          return await updateUserAsync(data);
        } catch (e) {
          return e.message;
        }
    default:
      break;
  }
};
