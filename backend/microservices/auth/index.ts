import { authMessBrockerInstance } from "../../app";
import { Queues } from "../../config/Message_Broker";

const consumeMessage = async () => {
    try {
        await authMessBrockerInstance.consumeQueueMessage(Queues.MAIN_API);
        authMessBrockerInstance.channel?.consume(Queues.MAIN_API, (message) => {
            if (message) {
                console.log("Message received: ", message.content.toString());
                authMessBrockerInstance.channel?.ack(message);
            }
        });
    } catch (error) {
        console.log("RabbitMQ - Consuming Mess - Error ", error);
    }
};

consumeMessage();