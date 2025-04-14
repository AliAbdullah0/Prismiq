import { Model, Schema } from './../src/types'
import fs from 'fs';

interface Field {
    name: string;
    type: string;
    isPrimaryKey?: boolean;
    default?: string;
    isUnique?: boolean;
}

class SchemaBuilder {
    private schema: Schema = {
        models: []
    };

    private getModel(modelName: string): Model {
        let model = this.schema.models.find(model => model.name === modelName);
        if (!model) {
            model = {
                name: modelName,
                fields: [],
                relations: []
            };
            this.schema.models.push(model);
        }
        return model;
    }

    createModel(modelName: string): void {
        this.getModel(modelName);
    }

    addField(modelName: string, fieldName: string, type: "Int" | "String" | "Boolean" | "String[]"| "Date" | "float" | "Json", defaultValue?: "cuid()" | "uid()" | "now()", isUnique?: boolean): void {
        const model = this.getModel(modelName);
        const typeMapping: { [key: string]: string } = {
            'Int': 'Int',
            'String': 'String',
            'String[]': 'String[]',
            'Boolean': 'Boolean',
            'Date': 'DateTime',
            'float': 'Float',
            'Json': 'Json'
        };
        const prismaType = typeMapping[type] || type;
        model.fields.push({
            name: fieldName,
            type: prismaType,
            default: defaultValue,
            isUnique: isUnique ?? false
        });
    }

    setPrimaryKey(modelName: string, fieldName: string): void {
        const model = this.getModel(modelName);
        const field = model.fields.find(field => field.name === fieldName);
        if (!field) throw new Error(`Field ${fieldName} not found in model ${modelName}`);
        field.isPrimaryKey = true;
    }

    addRelation(
        modelName: string,
        relationName: string,
        type: 'OneToMany' | 'ManyToMany' | 'OneToOne' | 'ManyToOne',
        relatedModelName: string,
        inverseRelationName?: string
    ): void {
        const model = this.getModel(modelName);
        model.relations.push({
            name: relationName,
            type,
            relatedModel: relatedModelName,
            inverseRelation: inverseRelationName ?? ''
        });
    }

    getSchema(): Schema {
        return this.schema;
    }

    reset(): void {
        this.schema = { models: [] };
    }

    private getManyToManyRelationName(modelA: string, modelB: string): string {
        const names = [modelA, modelB].sort();
        return `${names[0]}To${names[1]}`;
    }

    private getOneToOneRelationName(modelA: string, modelB: string): string {
        const names = [modelA, modelB].sort();
        return `RelationBetween${names[0]}And${names[1]}`;
    }

    generatePrismaSchema(): string {
        let prismaSchema = `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

        for (const model of this.schema.models) {
            for (const relation of model.relations) {
                if (relation.type === 'OneToOne') {
                    const relatedField = model.fields.find((f) =>
                        f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id')
                    );
                    if (relatedField) {
                        relatedField.isUnique = true;
                    }
                }
            }
        }

        for (const model of this.schema.models) {
            prismaSchema += `model ${model.name} {\n`;

            for (const field of model.fields) {
                let fieldDef = `  ${field.name} ${field.type}`;
                if (field.isPrimaryKey) {
                    fieldDef += ` @id`;
                }
                if (field.default) {
                    fieldDef += ` @default(${field.default})`;
                }
                if (field.isUnique) {
                    fieldDef += ` @unique`;
                }
                prismaSchema += `${fieldDef}\n`;
            }

            for (const relation of model.relations) {
                if (relation.type === 'OneToMany') {
                    prismaSchema += `  ${relation.name} ${relation.relatedModel}[]\n`;
                } else if (relation.type === 'ManyToOne') {
                    const relatedField = model.fields.find((f) =>
                        f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id')
                    );
                    if (relatedField) {
                        prismaSchema += `  ${relation.name} ${relation.relatedModel} @relation(fields: [${relatedField.name}], references: [id])\n`;
                    }
                } else if (relation.type === 'ManyToMany') {
                    const relationName = this.getManyToManyRelationName(model.name, relation.relatedModel);
                    prismaSchema += `  ${relation.name} ${relation.relatedModel}[] @relation("${relationName}")\n`;
                } else if (relation.type === 'OneToOne') {
                    const relationName = this.getOneToOneRelationName(model.name, relation.relatedModel);
                    const relatedField = model.fields.find((f) =>
                        f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id')
                    );
                    if (relatedField) {
                        prismaSchema += `  ${relation.name} ${relation.relatedModel} @relation(name: "${relationName}", fields: [${relatedField.name}], references: [id])\n`;
                    } else {
                        prismaSchema += `  ${relation.name} ${relation.relatedModel}? @relation(name: "${relationName}")\n`;
                    }
                }
            }

            prismaSchema += `}\n\n`;
        }
        return prismaSchema.trim();
    }
}

const builder = new SchemaBuilder();

export const createModel = (modelName: string) => builder.createModel(modelName);
export const addField = (modelName: string, fieldName: string, type: "Int" | "String" | "Boolean" | "Date" | "float" | "Json", defaultValue?: "cuid()" | "uid()" | "now()", isUnique?: boolean) =>
    builder.addField(modelName, fieldName, type, defaultValue, isUnique);
export const setPrimaryKey = (modelName: string, fieldName: string) =>
    builder.setPrimaryKey(modelName, fieldName);
export const addRelation = (
    modelName: string,
    relationName: string,
    type: 'OneToMany' | 'ManyToOne' | 'ManyToMany' | 'OneToOne',
    relatedModel: string,
    inverseRelation: string
) => builder.addRelation(modelName, relationName, type, relatedModel, inverseRelation);
export const getSchema = () => builder.getSchema();
export const generatePrismaSchema = () => builder.generatePrismaSchema();
export const savePrismaSchema = (tenantId: string) => {
    const schema = builder.generatePrismaSchema();
    fs.writeFileSync(`./prisma/${tenantId}.prisma`, schema);
};
export const reset = () => builder.reset();
