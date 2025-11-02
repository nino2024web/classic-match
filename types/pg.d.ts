declare module "pg" {
  export type QueryResultRow = Record<string, unknown>;

  export type QueryResult<T = QueryResultRow> = {
    rows: T[];
    rowCount: number;
  };

  export type QueryConfig = {
    text: string;
    values?: unknown[];
  };

  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
    query<T = unknown>(config: QueryConfig): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
