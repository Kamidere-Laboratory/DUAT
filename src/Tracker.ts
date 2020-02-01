import { Client, Message, GuildMember } from 'discord.js';
import { fromEvent, merge, Observable, MonoTypeOperatorFunction, OperatorFunction } from 'rxjs'
import { filter, map } from 'rxjs/operators';

interface TrackedUser {
  readonly id: string;
  readonly ts: number;
  readonly guildId: string;
};

const elementAtIndex = (i: number): OperatorFunction<
  readonly GuildMember[] | readonly Message[],
  Message | GuildMember
> => map(arr => arr[i])

const filterTextChannel = (): MonoTypeOperatorFunction<Message | GuildMember> => {
  return filter((data) => {
    if(data instanceof Message) {
      return data.channel.type === 'text';
    }
    return true;
  })
}

const filterGuild = (guild?: string): MonoTypeOperatorFunction<Message | GuildMember> => {
  return filter((data) => {
    if(!guild) return true;
    return data.guild.id === guild;
  })
}

const filterBots = (): MonoTypeOperatorFunction<Message | GuildMember> => {
  return filter((data) => {
    return data instanceof Message ? !data.author.bot : !data.user.bot
  })
}

const unifyData = (): OperatorFunction<Message | GuildMember, TrackedUser> => {
  return map((data) => {
    return {
      id: data instanceof Message ? data.author.id : data.id,
      ts: Date.now(),
      guildId: data.guild.id,
    }
  })
}

const newMessage$ = (client: Client, guild?: string): Observable<TrackedUser> => {
  return fromEvent<Message>(client, 'message').pipe(
    filterBots(),
    filterTextChannel(),
    filterGuild(guild),
    unifyData()
  )
}

const removeMessage$ = (client: Client, guild?: string): Observable<TrackedUser> => {
  return fromEvent<Message>(client, 'messageDelete').pipe(
    filterBots(),
    filterTextChannel(),
    filterGuild(guild),
    unifyData()
  )
}

const updateMessage$ = (client: Client, guild?: string): Observable<TrackedUser> => {
  return fromEvent<readonly Message[]>(client, 'messageUpdate').pipe(
    elementAtIndex(1),
    filterBots(),
    filterTextChannel(),
    filterGuild(guild),
    unifyData()
  )
}

const voiceState$ = (client: Client, guild?: string): Observable<TrackedUser> => {
  return fromEvent<readonly GuildMember[]>(client, 'voiceStateUpdate').pipe(
    elementAtIndex(1),
    filterBots(),
    filterTextChannel(),
    filterGuild(guild),
    unifyData()
  )
}

function trackEvents(client: Client, guild?: string): Observable<TrackedUser> {
  return merge(
    newMessage$(client, guild),
    removeMessage$(client, guild),
    updateMessage$(client, guild),
    voiceState$(client, guild),
  )
}

export default trackEvents;