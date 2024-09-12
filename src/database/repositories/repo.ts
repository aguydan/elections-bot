import { OperationWrapper } from '@/models/operation-wrapper.js';
import { Database } from '../schema/index.js';

export interface Repo {
    getAll?(...args: any): Promise<OperationWrapper<keyof Database, 'select'>[]>;
    getById?(id: number): Promise<OperationWrapper<keyof Database, 'select'>[]>;
    search?(
        params: Partial<OperationWrapper<keyof Database, 'select'>>
    ): Promise<OperationWrapper<keyof Database, 'select'>[]>;
    create?(data: OperationWrapper<keyof Database, 'insert'>): Promise<number>;
    update?(id: number, data: OperationWrapper<keyof Database, 'update'>): Promise<number>;
    delete?(id: number): Promise<number>;
}
