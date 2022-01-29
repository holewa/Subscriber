const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  startASubscription,
  checkForNewAdds,
  mongooseConnect,
} = require("./service");

app.use(cors());

mongooseConnect();
//provar kommentera ut
// app.use(bodyParser());

//starta en ny subscription från frontend endpoint
app.post("/startASubscription", async (req, res) => {
  startASubscription(req.body.email, req.body.searchWord);
});

//kollar om nya annonser har tillkommit
app.post("/checkForNewAdds", async (req, res) => {
  checkForNewAdds(req.body.email, req.body.searchWord);
});

const port = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${port}`);
});
