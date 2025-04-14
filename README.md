# ✨ Prismiq Schema Builder

A TypeScript-powered builder to generate **Prisma-compatible schema files** programmatically. Define models, fields, and relationships using a clean API and generate `.prisma` schemas effortlessly.

---

## 📦 Installation

Clone this repository and install dependencies:

```bash
npm install prismiq
```

---

## 🚀 Features

- Programmatic Prisma schema generation
- Define models and fields with types, defaults, primary keys, and unique constraints
- Add One-to-One, One-to-Many, Many-to-One, and Many-to-Many relationships
- Export the generated Prisma schema to a file
- Reset and reuse the builder easily

---

# SchemaBuilder Functions

This document explains the parameters for each function in the SchemaBuilder TypeScript class.

## createModel(modelName: string)

Creates a new model with the specified name.

- `modelName`: Name of the model to create.

## addField(modelName: string, fieldName: string, type: Type, defaultValue?: Default, isUnique?: boolean)

Adds a field to an existing model with the specified attributes.

- `modelName`: Name of the model to which the field belongs.
- `fieldName`: Name of the field to add.
- `type`: Type of the field. Supported types are "Int", "String", "Boolean", "Date", "float", "Json".
- `defaultValue` (optional): Default value for the field (e.g., "cuid()", "uid()", "now()").
- `isUnique` (optional): Specifies if the field should be unique.

## setPrimaryKey(modelName: string, fieldName: string)

Sets the primary key for a field in a model.

- `modelName`: Name of the model.
- `fieldName`: Name of the field to set as the primary key.

## addRelation(modelName: string, relationName: string, type: RelationType, relatedModel: string, inverseRelation?: string)

Defines a relationship between two models.

- `modelName`: Name of the model where the relationship originates.
- `relationName`: Name of the relationship.
- `type`: Type of the relationship. Supported types are "OneToMany", "ManyToOne", "ManyToMany", "OneToOne".
- `relatedModel`: Name of the related model.
- `inverseRelation` (optional): Name of the inverse relationship.

## generatePrismaSchema()

Generates a Prisma schema based on the configured models and relationships.

Returns: A string containing the generated Prisma schema.

## savePrismaSchema(Filename: string)

Saves the generated Prisma schema to a file.

- `FileName`: Identifier for the schema file.

## reset()

Resets the SchemaBuilder instance by clearing all models and configurations.



## 🧠 Usage

### 📁 Import Functions

```ts
import {
  createModel,
  addField,
  setPrimaryKey,
  addRelation,
  generatePrismaSchema,
  getSchema,
  savePrismaSchema,
  reset
} from 'prismiq';
```

---

### 🔨 Create a Model

```ts
createModel("User");
```

---

### 🧱 Add Fields

```ts
addField("User", "id", "Int");
addField("User", "email", "String", undefined, true); // unique
addField("User", "createdAt", "Date", "now()"); // default now()
```

---

### 🔐 Set Primary Key

```ts
setPrimaryKey("User", "id");
```

---

### 👥 Add Relations

#### One-to-One
```ts
addRelation("User", "profile", "OneToOne", "Profile", "user");
```

#### One-to-Many
```ts
addRelation("User", "posts", "OneToMany", "Post", "author");
```

#### Many-to-One
```ts
addRelation("Post", "author", "ManyToOne", "User", "posts");
```

#### Many-to-Many
```ts
addRelation("User", "groups", "ManyToMany", "Group", "members");
```

---

### 📄 Generate Schema as String

```ts
const schemaString = generatePrismaSchema();
console.log(schemaString);
```

---

### 📂 Save Schema to File

```ts
savePrismaSchema("schema");
// Output: ./prisma/schema.prisma
```

---

### ♻️ Reset Builder

```ts
reset(); // clears all models and fields
```

---

## 💡 Example

```ts
createModel("User");
addField("User", "id", "Int");
addField("User", "email", "String", undefined, true);
setPrimaryKey("User", "id");

createModel("Profile");
addField("Profile", "id", "Int");
setPrimaryKey("Profile", "id");

addRelation("User", "profile", "OneToOne", "Profile", "user");

console.log(generatePrismaSchema());
```

---

## 🙏 Contributing

Feel free to open issues or submit pull requests!

---

## 🎓 License

MIT License

