const { MongoClient } = require("mongodb");

async function main(getClient) {
  const client = getClient;
  try {
    await client.connect();
    await console.log("Connected to db");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

function getClient() {
  const uri =
    "mongodb+srv://holewa:mittlosen@cluster0.rdysa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  return client;
}

module.exports = {
  main,
  getClient,
};
