import { createModel, addField, setPrimaryKey, addRelation, generatePrismaSchema, reset } from '../src';

describe('Prysm SchemaBuilder', () => {
  beforeEach(() => {
    reset();
  });

  test('should generate a simple User schema with primary key and default value', () => {
    createModel('User');
    addField('User', 'id', 'Int', 'cuid()');
    setPrimaryKey('User', 'id');
    addField('User', 'name', 'String');

    const schema = generatePrismaSchema();
    expect(schema).toContain('model User');
    expect(schema).toContain('id Int @id @default(cuid())');
    expect(schema).toContain('name String');
  });

  test('should generate a field with explicit unique constraint', () => {
    createModel('User');
    addField('User', 'id', 'Int', 'cuid()');
    setPrimaryKey('User', 'id');
    addField('User', 'email', 'String', undefined, true);

    const schema = generatePrismaSchema();
    expect(schema).toContain('email String @unique');
  });

  test('should generate a one-to-one relationship with unique foreign key', () => {
    createModel('User');
    addField('User', 'id', 'Int');
    setPrimaryKey('User', 'id');
    addField('User', 'profileId', 'Int');
    createModel('Profile');
    addField('Profile', 'id', 'Int');
    setPrimaryKey('Profile', 'id');
    addRelation('User', 'profile', 'OneToOne', 'Profile', 'user');
    addRelation('Profile', 'user', 'OneToOne', 'User', 'profile');
  
    const schema = generatePrismaSchema();
    expect(schema).toContain('profileId Int @unique');
    expect(schema).toContain('profile Profile @relation(name: "RelationBetweenProfileAndUser", fields: [profileId], references: [id])');
    expect(schema).toContain('user User? @relation(name: "RelationBetweenProfileAndUser")');
  });

  test('should generate a many-to-one and one-to-many relationship', () => {
    createModel('User');
    addField('User', 'id', 'Int');
    setPrimaryKey('User', 'id');
    createModel('Post');
    addField('Post', 'id', 'Int');
    setPrimaryKey('Post', 'id');
    addField('Post', 'authorId', 'Int');
    addRelation('User', 'posts', 'OneToMany', 'Post', 'author');
    addRelation('Post', 'author', 'ManyToOne', 'User', 'posts');

    const schema = generatePrismaSchema();
    expect(schema).toContain('posts Post[]');
    expect(schema).toContain('authorId Int');
    expect(schema).toContain('author User @relation(fields: [authorId], references: [id])');
  });

  test('should generate a many-to-many relationship', () => {
    createModel('Post');
    addField('Post', 'id', 'Int');
    setPrimaryKey('Post', 'id');
    createModel('Tag');
    addField('Tag', 'id', 'Int');
    setPrimaryKey('Tag', 'id');
    addRelation('Post', 'tags', 'ManyToMany', 'Tag', 'posts');
    addRelation('Tag', 'posts', 'ManyToMany', 'Post', 'tags');

    const schema = generatePrismaSchema();
    expect(schema).toContain('tags Tag[] @relation("PostToTag")');
    expect(schema).toContain('posts Post[] @relation("PostToTag")');
  });

  test('should handle default values for DateTime fields', () => {
    createModel('Profile');
    addField('Profile', 'id', 'Int');
    setPrimaryKey('Profile', 'id');
    addField('Profile', 'createdAt', 'Date', 'now()');

    const schema = generatePrismaSchema();
    expect(schema).toContain('createdAt DateTime @default(now())');
  });
});
