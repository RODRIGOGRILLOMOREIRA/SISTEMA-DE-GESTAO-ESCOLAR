/**
 * Declaração de tipos para o módulo 'pg'
 * Solução temporária até @types/pg ser instalado
 * 
 * Para resolver permanentemente, execute:
 * npm install --save-dev @types/pg
 */

declare module 'pg' {
  import { EventEmitter } from 'events';

  export interface ClientConfig {
    user?: string;
    database?: string;
    password?: string;
    port?: number;
    host?: string;
    connectionString?: string;
    keepAlive?: boolean;
    stream?: any;
    statement_timeout?: false | number;
    parseInputDatesAsUTC?: boolean;
    ssl?: boolean | any;
    query_timeout?: number;
    keepAliveInitialDelayMillis?: number;
    idle_in_transaction_session_timeout?: number;
    application_name?: string;
    connectionTimeoutMillis?: number;
  }

  export interface PoolConfig extends ClientConfig {
    max?: number;
    min?: number;
    connectionTimeoutMillis?: number;
    idleTimeoutMillis?: number;
    maxUses?: number;
    allowExitOnIdle?: boolean;
  }

  export interface QueryResult<R = any> {
    command: string;
    rowCount: number;
    oid: number;
    rows: R[];
    fields: any[];
  }

  export interface QueryConfig {
    name?: string;
    text: string;
    values?: any[];
  }

  export class Pool extends EventEmitter {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    query<R = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<R>>;
    end(): Promise<void>;
    on(event: 'error', listener: (err: Error, client: PoolClient) => void): this;
    on(event: 'connect', listener: (client: PoolClient) => void): this;
    on(event: 'acquire', listener: (client: PoolClient) => void): this;
    on(event: 'remove', listener: (client: PoolClient) => void): this;
  }

  export class Client extends EventEmitter {
    constructor(config?: ClientConfig);
    connect(): Promise<void>;
    query<R = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<R>>;
    end(): Promise<void>;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'notice', listener: (notice: any) => void): this;
    on(event: 'notification', listener: (message: any) => void): this;
  }

  export interface PoolClient extends Client {
    release(err?: Error): void;
  }
}
