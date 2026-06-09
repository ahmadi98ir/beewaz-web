import {
  pgTable, uuid, varchar, integer, timestamp, index, primaryKey
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products, productVariants } from './products'

export const productAttributeTypes = pgTable('product_attribute_types', {
  id:        uuid('id').primaryKey().defaultRandom(),
  nameFa:    varchar('name_fa', { length: 60 }).notNull(),
  slug:      varchar('slug', { length: 40 }).unique().notNull(),
  inputType: varchar('input_type', { length: 20 }).notNull().default('select'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const productAttributeValues = pgTable('product_attribute_values', {
  id:        uuid('id').primaryKey().defaultRandom(),
  typeId:    uuid('type_id').notNull().references(() => productAttributeTypes.id, { onDelete: 'cascade' }),
  valueFa:   varchar('value_fa', { length: 80 }).notNull(),
  valueEn:   varchar('value_en', { length: 80 }),
  colorHex:  varchar('color_hex', { length: 7 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('attr_value_type_idx').on(t.typeId),
])

export const productVariantOptions = pgTable('product_variant_options', {
  variantId:        uuid('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  attributeValueId: uuid('attribute_value_id').notNull().references(() => productAttributeValues.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.variantId, t.attributeValueId] }),
  index('variant_options_variant_idx').on(t.variantId),
  index('variant_options_attr_val_idx').on(t.attributeValueId),
])

export const productAttributeTypeAssignments = pgTable('product_attribute_type_assignments', {
  productId:      uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  attributeTypeId: uuid('attribute_type_id').notNull().references(() => productAttributeTypes.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.productId, t.attributeTypeId] }),
])

export const attributeTypesRelations = relations(productAttributeTypes, ({ many }) => ({
  values: many(productAttributeValues),
}))

export const attributeValuesRelations = relations(productAttributeValues, ({ one, many }) => ({
  type:           one(productAttributeTypes, { fields: [productAttributeValues.typeId], references: [productAttributeTypes.id] }),
  variantOptions: many(productVariantOptions),
}))

export const variantOptionsRelations = relations(productVariantOptions, ({ one }) => ({
  variant:        one(productVariants, { fields: [productVariantOptions.variantId], references: [productVariants.id] }),
  attributeValue: one(productAttributeValues, { fields: [productVariantOptions.attributeValueId], references: [productAttributeValues.id] }),
}))

export type ProductAttributeType  = typeof productAttributeTypes.$inferSelect
export type ProductAttributeValue = typeof productAttributeValues.$inferSelect
export type ProductVariantOption  = typeof productVariantOptions.$inferSelect
