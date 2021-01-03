
export interface ModelBackend {
  delete_(tablename: string, id: string): boolean;
  insert(tablename: string, data: Object): [string,Object] | null;
  update(tablename: string, id: string, data: Object): Object | null;
  find(tablename: string, id: string): Object | null;
  all(tablename: string): ReadonlyArray<[string,Object]>;
}
