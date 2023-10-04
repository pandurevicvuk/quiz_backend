import { createClient } from "redis";
import { HttpException } from "../utils/http-exception";

export const subscriber = createClient();
export const publisher = createClient();

const connectRedis = async () => {
  try {
    await publisher.connect();
    await subscriber.connect();

    await publisher.set("queue", JSON.stringify([]));
    await subscriber.subscribe("queue", queueChannelListener);
  } catch (error) {
    console.log(error);
    throw new HttpException(400, `Redis Init Exception`);
  }
};
connectRedis();

const queueChannelListener = async (message: any, subscribe: any) => {
  try {
    const queue = await getWaitingQueue();
    console.log("MSG: ", message);
    console.log("QUEUE: ", queue);

    if (queue.length === 2) {
      await publisher.set("queue", "[]");
      //start
      return;
    }
    queue.push(message);
    await publisher.set("queue", JSON.stringify(queue));
  } catch (err) {
    console.log(err);
    throw new HttpException(400, `Redis Queue Listener Exception`);
  }
};
