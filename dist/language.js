"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reset = exports.savePrismaSchema = exports.generatePrismaSchema = exports.getSchema = exports.addRelation = exports.setPrimaryKey = exports.addField = exports.createModel = void 0;
const fs_1 = __importDefault(require("fs"));
class SchemaBuilder {
    constructor() {
        this.schema = {
            models: []
        };
    }
    getModel(modelName) {
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
    createModel(modelName) {
        this.getModel(modelName);
    }
    addField(modelName, fieldName, type, defaultValue, isUnique) {
        const model = this.getModel(modelName);
        const typeMapping = {
            'Int': 'Int',
            'String': 'String',
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
    setPrimaryKey(modelName, fieldName) {
        const model = this.getModel(modelName);
        const field = model.fields.find(field => field.name === fieldName);
        if (!field)
            throw new Error(`Field ${fieldName} not found in model ${modelName}`);
        field.isPrimaryKey = true;
    }
    addRelation(modelName, relationName, type, relatedModelName, inverseRelationName) {
        const model = this.getModel(modelName);
        model.relations.push({
            name: relationName,
            type,
            relatedModel: relatedModelName,
            inverseRelation: inverseRelationName ?? ''
        });
    }
    getSchema() {
        return this.schema;
    }
    reset() {
        this.schema = { models: [] };
    }
    getManyToManyRelationName(modelA, modelB) {
        const names = [modelA, modelB].sort();
        return `${names[0]}To${names[1]}`;
    }
    getOneToOneRelationName(modelA, modelB) {
        const names = [modelA, modelB].sort();
        return `RelationBetween${names[0]}And${names[1]}`;
    }
    generatePrismaSchema() {
        let prismaSchema = `datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;
        // Preprocess relations to set isUnique for one-to-one relationships
        for (const model of this.schema.models) {
            for (const relation of model.relations) {
                if (relation.type === 'OneToOne') {
                    const relatedField = model.fields.find((f) => f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id'));
                    if (relatedField) {
                        relatedField.isUnique = true;
                    }
                }
            }
        }
        // Generate schema
        for (const model of this.schema.models) {
            prismaSchema += `model ${model.name} {\n`;
            // Generate fields
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
            // Generate relations
            for (const relation of model.relations) {
                if (relation.type === 'OneToMany') {
                    prismaSchema += `  ${relation.name} ${relation.relatedModel}[]\n`;
                }
                else if (relation.type === 'ManyToOne') {
                    const relatedField = model.fields.find((f) => f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id'));
                    if (relatedField) {
                        prismaSchema += `  ${relation.name} ${relation.relatedModel} @relation(fields: [${relatedField.name}], references: [id])\n`;
                    }
                }
                else if (relation.type === 'ManyToMany') {
                    const relationName = this.getManyToManyRelationName(model.name, relation.relatedModel);
                    prismaSchema += `  ${relation.name} ${relation.relatedModel}[] @relation("${relationName}")\n`;
                }
                else if (relation.type === 'OneToOne') {
                    const relationName = this.getOneToOneRelationName(model.name, relation.relatedModel);
                    const relatedField = model.fields.find((f) => f.name.toLowerCase().includes(relation.name.toLowerCase() + 'id'));
                    if (relatedField) {
                        prismaSchema += `  ${relation.name} ${relation.relatedModel} @relation(name: "${relationName}", fields: [${relatedField.name}], references: [id])\n`;
                    }
                    else {
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
const createModel = (modelName) => builder.createModel(modelName);
exports.createModel = createModel;
const addField = (modelName, fieldName, type, defaultValue, isUnique) => builder.addField(modelName, fieldName, type, defaultValue, isUnique);
exports.addField = addField;
const setPrimaryKey = (modelName, fieldName) => builder.setPrimaryKey(modelName, fieldName);
exports.setPrimaryKey = setPrimaryKey;
const addRelation = (modelName, relationName, type, relatedModel, inverseRelation) => builder.addRelation(modelName, relationName, type, relatedModel, inverseRelation);
exports.addRelation = addRelation;
const getSchema = () => builder.getSchema();
exports.getSchema = getSchema;
const generatePrismaSchema = () => builder.generatePrismaSchema();
exports.generatePrismaSchema = generatePrismaSchema;
const savePrismaSchema = (tenantId) => {
    const schema = builder.generatePrismaSchema();
    fs_1.default.writeFileSync(`./prisma/${tenantId}.prisma`, schema);
};
exports.savePrismaSchema = savePrismaSchema;
const reset = () => builder.reset();
exports.reset = reset;
