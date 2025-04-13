export interface Field {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    isUnique: boolean;
    default?: "cuid()" | "uid()" | "now()";
}
export interface Relation {
    name: string;
    type: 'OneToMany' | 'ManyToMany' | 'OneToOne' | 'ManyToOne';
    relatedModel: string;
    inverseRelation: string;
}
export interface Model {
    name: string;
    fields: Field[];
    relations: Relation[];
}
export interface Schema {
    models: Model[];
}
