
export type ColumnInfo = {readonly name: string, readonly params: {readonly unique?: boolean}};

export type Migration = { readonly tableName: string, readonly columns: ReadonlyArray<ColumnInfo>};

export interface DBBackend {
  delete(tablename: string, id: string): boolean;
  insert(tablename: string, data: Object): [string,Object] | null;
  update(tablename: string, id: string, data: Object): Object | null;
  find(tablename: string, id: string): Object | null;
  all(tablename: string): ReadonlyArray<[string,Object]>;
  isPrepared(): boolean;
  migrate(migrations: ReadonlyArray<Migration>): boolean
}
