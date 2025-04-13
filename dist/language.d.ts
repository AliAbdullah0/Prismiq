import { Schema } from './../src/types';
export declare const createModel: (modelName: string) => void;
export declare const addField: (modelName: string, fieldName: string, type: "Int" | "String" | "Boolean" | "Date" | "float" | "Json", defaultValue?: "cuid()" | "uid()" | "now()", isUnique?: boolean) => void;
export declare const setPrimaryKey: (modelName: string, fieldName: string) => void;
export declare const addRelation: (modelName: string, relationName: string, type: "OneToMany" | "ManyToOne" | "ManyToMany" | "OneToOne", relatedModel: string, inverseRelation: string) => void;
export declare const getSchema: () => Schema;
export declare const generatePrismaSchema: () => string;
export declare const savePrismaSchema: (tenantId: string) => void;
export declare const reset: () => void;
