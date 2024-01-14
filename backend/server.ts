import app from "./app";

let PORT = 5005;
const env = process.env.NODE_ENV;

if (env == "test") {
    PORT = 3001;
    console.log("🧪 Testing Enviornment");
} else if (env == "dev") {
    PORT = 5001;
    console.log("💻 Development Enviornment");
}

app.listen(PORT, () => {
    console.log("Server's listening on: ", PORT);
});