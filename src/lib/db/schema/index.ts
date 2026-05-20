// ─── Enums (shared) ──────────────────────────────────────────────────────────────────────────────
export {
  userRoleEnum,
  userStatusEnum,
  otpPurposeEnum,
  productStatusEnum,
  productConditionEnum,
  reviewStatusEnum,
} from './enums'

// ─── Users ─────────────────────────────────────────────────────────────────────────────────
export {
  users,
  addresses,
  otpCodes,
  sessions,
  accounts,
  verificationTokens,
  auditLogs,
  usersRelations,
  addressesRelations,
  sessionsRelations,
  accountsRelations,
  auditLogsRelations,
  type User,
  type NewUser,
  type Address,
  type NewAddress,
  type OtpCode,
  type NewOtpCode,
  type AuditLog,
  type NewAuditLog,
} from './users'

// ─── Products (includes brands, categories, variants, inventory, images, reviews) ──
export {
  brands,
  categories,
  products,
  productVariants,
  inventory,
  productImages,
  reviews,
  brandsRelations,
  categoriesRelations,
  productsRelations,
  productVariantsRelations,
  inventoryRelations,
  productImagesRelations,
  reviewsRelations,
  type Brand,
  type NewBrand,
  type Category,
  type NewCategory,
  type Product,
  type NewProduct,
  type ProductVariant,
  type NewProductVariant,
  type Inventory,
  type ProductImage,
  type NewProductImage,
  type Review,
  type NewReview,
} from './products'

// ─── Orders ────────────────────────────────────────────────────────────────────────────────
export {
  orderStatusEnum,
  paymentMethodEnum,
  orders,
  orderItems,
  ordersRelations,
  orderItemsRelations,
  type Order,
  type NewOrder,
  type OrderStatus,
  type OrderItem,
  type NewOrderItem,
} from './orders'

// ─── Chat & CRM ────────────────────────────────────────────────────────────────────────
export {
  sessionStatusEnum,
  messageRoleEnum,
  leadStatusEnum,
  chatSessions,
  chatMessages,
  leads,
  chatSessionsRelations,
  chatMessagesRelations,
  leadsRelations,
  type ChatSession,
  type NewChatSession,
  type ChatMessage,
  type NewChatMessage,
  type Lead,
  type NewLead,
  type LeadStatus,
} from './chat'

// ─── CMS ──────────────────────────────────────────────────────────────────────────────────
export {
  contentTypeEnum,
  siteSettings,
  pageContent,
  pageViews,
  type SiteSetting,
  type NewSiteSetting,
  type PageContent,
  type NewPageContent,
  type PageView,
  type NewPageView,
} from './cms'
