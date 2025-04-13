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

