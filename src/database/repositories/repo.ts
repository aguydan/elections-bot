export interface Repo {
    getAll?(): Promise<Record<string, any>[]>;
    getById?(id: number): Promise<Record<string, any>>;
    search?(params: Partial<Record<string, any>>): Promise<Record<string, any>[]>;
    create?(data: Record<string, any>): Promise<number>;
    update?(id: number, data: Record<string, any>): Promise<number>;
    delete?(id: number): Promise<number>;
}
