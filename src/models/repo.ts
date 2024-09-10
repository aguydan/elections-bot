export interface Repo {
    getAll(): Promise<any[]>;
    getById(id: number): Promise<any[]>;
    search?(params: Partial<any>): Promise<any[]>;
    create(data: any): Promise<number>;
    update?(id: number): Promise<number>;
    delete?(id: number): Promise<number>;
}
