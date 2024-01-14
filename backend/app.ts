import express from "express";
import { graphqlHTTP } from "express-graphql";
import main_schema from "./microservices/main_api/main_schema";
import resolvers from "./microservices/main_api/resolvers";
import GeneralMessageBrocker, {
    IConfig,
    Queues,
} from "./config/Message_Broker";

const app = express();

const messBrockerConfig: IConfig = {
    exchange: {
        name: "graphql_exchange",
        type: "direct",
    },
    queues: [
        { name: Queues.AUTH, key: "login" },
        { name: Queues.AUTH, key: "signup" },
        { name: Queues.MAIN_API, key: "entry" },
    ],
};

app.use(
    "/graphql",
    (req, res, next) => {
        authMessBrockerInstance
            .pushMessageToQueue("User - is asking us", Queues.MAIN_API)
            .then((response) => {
                console.log("RabbitMQ - Sending - Response: ", response);
            })
            .catch((err) => {
                console.log("RabbitMQ - Sending - Errro: ", err);
            })
            .finally(next);
    },
    graphqlHTTP({
        schema: main_schema,
        graphiql: true,
        rootValue: resolvers,
    })
);

export const authMessBrockerInstance = new GeneralMessageBrocker(
    messBrockerConfig
);
export default app;
