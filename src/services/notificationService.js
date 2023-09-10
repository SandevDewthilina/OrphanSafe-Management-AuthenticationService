import { publishMessage, getChannel } from "../lib/rabbitmq/index.js";
import { NOTIFICATION_SERVICE_BINDING_KEY } from "../config/index.js";

export const unicastNotificationAsync = async (title, body, userId) => {
    await publishMessage(getChannel(), NOTIFICATION_SERVICE_BINDING_KEY, {
        event: "UNICAST",
        data: {
          notification: {
            title: title,
            body: body,
          },
          userId: userId
        },
      });
};
