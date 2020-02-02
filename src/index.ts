import { Client } from 'discord.js';
import { config as initEnv } from 'dotenv';
import Tracker, {TrackedUser} from './Tracker';
initEnv()

const client = new Client();

client
  .on('ready', () => {
    console.log('Ready for tracking!');
    client.user.setPresence({
      game: {
        name: 'you!',
        type: 'WATCHING'
      }
    })
    Tracker(client).subscribe((user: TrackedUser) => {
      console.log(user);
    });
  });

client.login(process.env.DSC_TOKEN);
