import { Channel, ConsumeMessage, Replies, connect } from "amqplib";

const messageBrockerURL = "amqp://localhost:5672";
export const generalMessBrockerConfig = {
    exchange: {
        name: "graphql_exchange",
        type: "direct",
    },
};
export enum Queues {
    AUTH = "auth",
    MAIN_API = "main_api",
}

export interface IConfig {
    exchange: {
        name: string;
        type: "direct" | "topic" | "headers" | "fanout" | "match";
    };
    queues: { name: Queues; key: string }[];
}

export default class GeneralMessageBrocker {
    channel: Channel | null = null;
    config: IConfig;
    messageToConsume: null | ConsumeMessage = null;

    constructor(config: IConfig) {
        this.config = config;
    }

    async init() {
        if (!this.channel) {
            try {
                const channel = await connect(messageBrockerURL);
                this.channel = await channel.createChannel();
                await this.channel.assertExchange(
                    this.config.exchange.name,
                    this.config.exchange.type,
                    {
                        durable: true,
                    }
                );

                this.config.queues.forEach(async (queue) => {
                    if (this.channel) {
                        await this.channel.assertQueue(queue.name, { durable: true });
                        await this.channel.bindQueue(
                            queue.name,
                            this.config.exchange.name,
                            queue.key
                        );
                    }
                });

                console.log("⛳️ RabbitMQ - Init - Listening");
            } catch (error) {
                console.log("💔 RabbitMQ - Init - Error: ", error);
                process.exit();
            }
        }
    }

    async initConnFirst() {
        const startTiming = new Date();
        while (!this.channel) {
            const currentTiming = new Date();
            if (diffBetweenTwoDates(startTiming, currentTiming) > 10000) {
                console.log("💔 RabbitMQ - Init - Timedout (10s)");
                return false;
            }
            console.log("Connecting first")
            await this.init();
            return true;
        }
        return true;
    }

    async pushMessageToQueue(
        messageContent: Object | any[] | string | number,
        queueName: Queues
    ): Promise<boolean> {
        const response = await this.initConnFirst();
        console.log("Publish 1: ", response);
        if (!response) return false;

        this.channel ? console.log("Publish 2: ", this.channel) : "";
        if (!this.channel) return false;

        try {
            const adaptMessContent = Buffer.from(JSON.stringify(messageContent));

            const status = this.channel.sendToQueue(queueName, adaptMessContent);
            return status;
        } catch (error) {
            console.log("💔 RabbitMQ - Sending Message to Queue - Error: ", error);
            return false;
        }
    }

    async consumeQueueMessage(queueName: Queues): Promise<false | any> {
        const response = await this.initConnFirst();
        if (!response) return false;

        if (!this.channel) return false;

        try {
            await this.channel.consume(queueName, (mess) => {
                if (mess && this.channel) {
                    this.messageToConsume = mess;
                }
            });
        } catch (error) {
            console.log(
                "💔 RabbitMQ - Consuming Message from Queue - Error: ",
                error
            );
            return false;
        }
    }

    retrieveMess(msg: any) {
        return msg;
    }
}

const diffBetweenTwoDates = (date1: Date, date2: Date): number => {
    const date1InMill = date1.getMilliseconds();
    const date2InMill = date2.getMilliseconds();

    return date2InMill - date1InMill;
};
