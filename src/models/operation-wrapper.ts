import { Database } from '@/database/schema/index.js';
import { Selectable, Insertable, Updateable } from 'kysely';

//Dynamically wraps Kysely table types into the Kysely types applicable for database operations.
type TablesToOperationWrappers = {
    [T in keyof Database]: {
        select: Selectable<Database[T]>;
        insert: Insertable<Database[T]>;
        update: Updateable<Database[T]>;
    };
};

//Finds a wrapper type based on the database table and and on the operation.
export type OperationWrapper<
    T extends keyof Database,
    O extends keyof TablesToOperationWrappers[T]
> = TablesToOperationWrappers[T][O];
