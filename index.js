const express = require("express")
const port = 8000;
const app = express();

app.use(express.static(__dirname))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Primzahlen.html");
})

app.listen(port || 8000, () => {
    console.log("Listening on port " + port)
})