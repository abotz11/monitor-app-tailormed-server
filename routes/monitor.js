const express = require("express");
var cors = require("cors");
const bl = require("../businessLogic/businessLogic");

const app = express();
const port = 5000;

app.use(cors());

app.get("/", (req, res) => {
  bl.GetAllAssistanceProgramsAsync((result) => {
    res.send(result);
  });
});

app.get("/update", (req, res) => {
  console.log(`Method: Get, route: /update`);
  bl.UpdateAssistanceProgramManuallyAsync((result) => {
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
