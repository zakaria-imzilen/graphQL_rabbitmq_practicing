import { buildSchema } from "graphql";

export default buildSchema(`
    type Car {
        id: ID!
        name: String!
        model: Int!
        description: String!
    }

    type Query {
        getCars: [Car]
        getCar(id: ID!): Car
    }

    type Mutation {
        updateCar(id: ID!, name: String, model: Int, description: String): Car
    }
`);
