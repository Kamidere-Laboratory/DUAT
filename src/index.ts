import { Client, Message, GuildMember } from 'discord.js';
import { fromEvent, merge, Observable, MonoTypeOperatorFunction, OperatorFunction } from 'rxjs'
import { filter, map } from 'rxjs/operators';
import { Database, DatabaseType } from './database';

import debug from 'debug'
import { config as initEnv } from 'dotenv';
initEnv()
const logger = debug('DUAT:Bot')

const client = new Client()

interface TrackedUser {
  id: string;
  ts: number;
}

const elementAtIndex = (i: number):
  OperatorFunction<GuildMember[] | Message[], Message | GuildMember> => map(arr => arr[i])

const filterGuild = (): MonoTypeOperatorFunction<Message | GuildMember> => 
  filter((data) => {
    return data.guild.id === process.env.DSC_GUILD;
  });

const filterBots = (): MonoTypeOperatorFunction<Message | GuildMember> => 
  filter((data) => {
    return data instanceof Message ? !data.author.bot : !data.user.bot
  });

const unifyData = (): OperatorFunction<Message | GuildMember, TrackedUser> => map((data) => {
  return {
    id: data instanceof Message ? data.author.id : data.id,
    ts: Date.now(),
  }
});

client
  .on('ready', () => {
  logger('Ready for tracking!');
  });

const events$: Observable<TrackedUser> = merge(
  fromEvent<Message>(client, 'message').pipe(filterBots(), filterGuild(), unifyData()),
  fromEvent<Message>(client, 'messageDelete').pipe(filterBots(), filterGuild(), unifyData()),
  fromEvent<Message[]>(client, 'messageUpdate').pipe(elementAtIndex(1), filterBots(), filterGuild(), unifyData()),
  fromEvent<GuildMember[]>(client, 'voiceStateUpdate').pipe(elementAtIndex(1), filterBots(), filterGuild(), unifyData()),
)

events$
  .subscribe((data) => {
    logger(data)
  });

client.login(process.env.DSC_TOKEN);