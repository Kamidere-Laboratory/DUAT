import { Sqlite } from '.'

export enum DatabaseType {
  "Sqlite" = "sqlite",
  "Graphite" = "graphite",
  "Influx" = "influx",
}

interface SqliteOptions {
  path: string;
  table: string;
}

interface GraphiteOptions {
  url: string;
  path: string;
  table: string;
  creditionals: {
    login: string;
    password: string;
  };
}

interface InfluxOptions {
  url: string;
  path: string;
  table: string;
  creditionals: {
    login: string;
    password: string;
  };
}

export class Database {
  private db: any; // TODO: Add typings
  constructor(type: DatabaseType, options: SqliteOptions | GraphiteOptions | InfluxOptions) {
    switch(type) {
      case DatabaseType.Sqlite:
        this.db = DatabaseType.Sqlite;
        break;
      case DatabaseType.Graphite:
        this.db = DatabaseType.Graphite;
        break;
      case DatabaseType.Influx:
        this.db = DatabaseType.Influx;
        break;
    }
  }

  
  static create(type: DatabaseType.Influx, options: InfluxOptions): Database
  static create(type: DatabaseType.Graphite, options: GraphiteOptions): Database 
  static create(type: DatabaseType.Sqlite, options: SqliteOptions): Database;
  static create(type: DatabaseType, options: SqliteOptions | GraphiteOptions | InfluxOptions): Database {
    return new this(type, options);
  }
}
