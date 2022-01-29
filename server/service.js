const Search = require("./Search");
const { scrape } = require("./scraper");
const mongoose = require("mongoose");

async function startASubscription(email, searchWord) {
  //kollar om användaren finns i db
  const userExists = await Search.exists({ email: email });

  //skrapar data
  const data = await scrape(
    "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
    searchWord
  );

  //om användaren redan finns:
  if (userExists) {
    //hämtar given användare
    const user = await Search.where({ email: email }).findOne({
      searchWord: "",
    });

    //hämtar användarens olika sökningar inkl resultat
    const searchArray = user.search;

    let searchDoneBefore = false;
    //Ittererar över användarens tidigare sökningar och ser om samma sökning gjorts
    searchArray.forEach((ad) => {
      if (ad.searchWord === searchWord) {
        searchDoneBefore = true;
      }
    });

    //om resultat är 0 så skapas det en ny sökning
    if (!searchDoneBefore) {
      console.log("Skapar sökning...");

      //logiken för att lägga till en sådan sökning till användaren

      //lägger till den nya datan i arrayen som plockades ur från användaren
      searchArray.push({ searchWord: searchWord, adArray: data });

      //skapar ett nytt sökobjekt
      const updatedSearch = {
        email: email,
        search: searchArray,
      };

      //sparar användarens nya objekt
      await user.save();

      console.log(user);
    } else {
      console.log("sökningen har redan gjorts!");
    }
  } else {
    //skapar ett searchObject som läggs till i db
    const search = {
      email: email,
      search: [
        {
          searchWord: searchWord,
          adArray: data,
        },
      ],
    };

    //skapar data för ny användare
    const dbData = await Search.create(search);

    console.log(dbData);
  }
  //sätter upp subscription på den givna mailen och sökordet
  const minutesInMilliseconds = 1000 * 60;
  setInterval(
    () => checkForNewAdds(email, searchWord),
    minutesInMilliseconds * 5
  );
}

async function checkForNewAdds(email, searchWord) {
  // hämtar användare ur db och kollar sista annonsens titel och tidsstämpel
  const SearchObj = await Search.where({ email: email }).findOne({
    searchWord: "",
  });
  const searchesFromDb = SearchObj.search;

  let lastAdTitle = "";
  let lastTimeStamp = "";

  // skrapar data åt en given användare med ett visst sökord och kollar sista annonsens titel och tidsstämpel
  const data = await scrape(
    "https://www.bortskankes.se/index.php?lan=&kat=&searchtxt=&page=0&showclosed=n",
    searchWord
  );

  const scrapedAds = data;
  const lastScrapedAdTitle = scrapedAds[0].adTitle;
  const lastScrapedTimeStamp = scrapedAds[0].timeStamp;

  searchesFromDb.forEach(async (search) => {
    if (search.searchWord === searchWord) {
      //hämtar ut den senaste annonsrubriken och tidsstämpeln ur listan
      length = search.adArray.length;
      // lastAdTitle = search.adArray[length].adTitle;
      // lastTimeStamp = search.adArray[length].timeStamp;

      let adTitlesMatch = false;
      for (let i = 0; i < length; i++) {
        //kollar om den senast skrapade annons finns i db
        if (search.adArray[i].adTitle === lastScrapedAdTitle) {
          adTitlesMatch = true;
        }
      }
      if (!adTitlesMatch) {
        // stoppar in senaste annons- och tidsstämpel från skrap
        search.adArray.push({
          adTitle: lastScrapedAdTitle,
          timeStamp: lastScrapedTimeStamp,
        });
        //skapar ett uppdaterat searchObject som läggs in i db
        const updSearch = {
          email: email,
          search: searchesFromDb,
        };
        await SearchObj.save(updSearch);

        console.log("Ny annons hittad, sparad i db!");
      }
    }
  });
}

const mongooseConnect = () => {
  mongoose.connect(
    "mongodb+srv://holewa:mittlosen@cluster0.rdysa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
  );
};

module.exports = {
  startASubscription,
  checkForNewAdds,
  mongooseConnect,
};
