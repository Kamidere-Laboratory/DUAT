import { Client, Message, GuildMember } from 'discord.js';
import { fromEvent, merge, Observable, MonoTypeOperatorFunction, OperatorFunction } from 'rxjs'
import { filter, map } from 'rxjs/operators';
import { Database } from 'sqlite3'
import { config as initEnv } from 'dotenv';
initEnv()

const trackingDatabase = new Database('tracking.db');
trackingDatabase.run('CREATE TABLE IF NOT EXISTS tracking (ID INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT UNIQUE NOT NULL, ts INTEGER NOT NULL);');

const client = new Client()

interface TrackedUser {
  id: string;
  ts: number;
}

const elementAtIndex = (i: number): OperatorFunction<GuildMember[] | Message[], Message | GuildMember> => map(arr => arr[i])

const filterGuild = (): MonoTypeOperatorFunction<Message | GuildMember> => filter((data) => {
  return data.guild.id === process.env.DSC_GUILD;
})


const unifyData = (): OperatorFunction<Message | GuildMember, TrackedUser> => map((data) => {
  return {
    id: data instanceof Message ? data.author.id : data.id,
    ts: Date.now(),
  }
})

client
  .on('ready', () => {
  console.log('Ready for tracking!');
  client.user.setPresence({
    game: {
      name: 'you!',
      type: 'WATCHING'
    }
  })
  });

const events$: Observable<TrackedUser> = merge(
  fromEvent<Message>(client, 'message').pipe(filterGuild(), unifyData()),
  fromEvent<Message>(client, 'messageDelete').pipe(filterGuild(), unifyData()),
  fromEvent<Message[]>(client, 'messageUpdate').pipe(elementAtIndex(1), filterGuild(), unifyData()),
  fromEvent<GuildMember[]>(client, 'voiceStateUpdate').pipe(elementAtIndex(1), filterGuild(), unifyData()),
)

events$
  .subscribe((data) => {
    try {
      trackingDatabase.serialize(() => {
        trackingDatabase.prepare(`INSERT INTO tracking (user, ts) VALUES (?,?);`).run([data.id, data.ts], (err: {
          errno: number;
          code: string;
        }) => {
          if(err && err.errno === 19) trackingDatabase.prepare(`UPDATE tracking SET ts=? WHERE user=?;`).run(data.ts, data.id);
        })
      })
    } catch(error) {
      console.error(error)
    }
  })

client.login(process.env.DSC_TOKEN);