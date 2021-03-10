import { createbot } from "./framework";
import { getenv } from "./rando";
import { config } from "dotenv";

(async () => {
   config();

   createbot({
      stopevents: ["exit", "SIGINT", "SIGTERM"],
      token: getenv("TOKEN")
   });
})().catch(e => {
   console.error(e);
   process.exitCode = 1;
});
