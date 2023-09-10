import amqplib from "amqplib";
import { v4 as uuid4 } from "uuid";
import { MESSAGE_BROKER_URL, EXCHANGE_NAME } from "../../config/index.js";
import { subscribeEvents } from "../../services/eventSubscribeService.js";
/* <===================RABBITMQ UTILS====================> */

// create a channel
const createChannel = async () => {
  try {
    const connection = await amqplib.connect(MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (error) {
    throw error;
  }
};

// intialize the channel
export const initChannel = async () => {
  const channel = await createChannel();
  process.channel = channel;
};

// get channel instance
export const getChannel = () => {
  return process.channel;
};

// publish a message
export const publishMessage = async (channel, binding_key, payload) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(JSON.stringify(payload)));
    console.log('message publish to ', binding_key, payload)
  } catch (error) {
    throw error;
  }
};

// consume a message
export const subscribeMessage = async (channel, binding_key) => {
  try {
    // create a queue
    const appQueue = await channel.assertQueue("test_queue");

    // bind queue to exchange
    channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);

    // consume data
    channel.consume(appQueue.queue, (data) => {
      // subscribe to data
      subscribeEvents(data.content.toString());
      // acknowledge queue
      channel.ack(data);
    });
  } catch (error) {
    throw error;
  }
};

// RPC Observer
export const RPCObserver = async (RPC_QUEUE_NAME) => {
  // init rabbitmq
  await initChannel();

  const channel = await getChannel();
  // listen on RPC_QUEUE
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });
  // one unacknowledged message at a time
  channel.prefetch(1);
  // consume messages
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg.content) {
        const request_payload = JSON.parse(msg.content.toString());

        // handle request and send data
        const response = { fakedata: "this is fake data!" };

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
      }
    },
    { noAck: false }
  );
};


// RPC Request
export const RPCRequest = async (RPC_QUEUE_NAME, payload) => {
  const uuid = uuid4();
  return await requestData(RPC_QUEUE_NAME, payload, uuid);
};

const requestData = async (RPC_QUEUE_NAME, payload, uuid) => {
  const channel = await getChannel();

  // create a temp queue
  const q = await channel.assertQueue(RPC_QUEUE_NAME, "", { exclusive: true });

  channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    replyTo: q.queue,
    correlationId: uuid,
  });

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      channel.close()
      reject("API was not responding, timedout after 10 seconds")
    }, 10000);
    channel.consume(
      q.queue,
      (msg) => {
        if (msg.properties.correlationId === uuid) {
          resolve(JSON.parse(msg.content.toString()));
          clearTimeout(timeout)
        } else {
          reject("data not found");
        }
      },
      {
        noAck: true,
      }
    );
  });
};