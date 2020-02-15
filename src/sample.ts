import { Client } from 'discord.js';
import { config as initEnv } from 'dotenv';
import Tracker, { TrackedUser } from './Tracker';
import { Subscription } from 'rxjs';
initEnv()

const client = new Client();
// eslint-disable-next-line functional/no-let
let subscription: Subscription; 

client
  .on('ready', () => {
    console.log('Ready for tracking!');
      client.user.setPresence({
        game: {
          name: 'you!',
          type: 'WATCHING'
        }
      })
      subscription = Tracker(client).subscribe((user: TrackedUser) => {
        console.log(user);
      });
  });

client.on('disconnect', () => {
  subscription.unsubscribe();
})

client.login(process.env.DSC_TOKEN);
