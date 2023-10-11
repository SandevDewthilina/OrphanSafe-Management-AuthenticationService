import { publishMessage, createChannel } from "../lib/rabbitmq/index.js";
import { NOTIFICATION_SERVICE_BINDING_KEY } from "../config/index.js";

export const unicastNotificationAsync = async (title, body, userId) => {
    publishMessage(await createChannel(), NOTIFICATION_SERVICE_BINDING_KEY, {
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
