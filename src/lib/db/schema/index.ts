// ─── Users ───────────────────────────────────────────────────────────────────────────────
export {
  userRoleEnum,
  users,
  type User,
  type NewUser,
  type UserRole,
} from './users'

// ─── Products ─────────────────────────────────────────────────────────────────────────────
export {
  productStatusEnum,
  products,
  productVariants,
  productImages,
  productSpecs,
  productsRelations,
  productVariantsRelations,
  productImagesRelations,
  productSpecsRelations,
  type Product,
  type NewProduct,
  type ProductVariant,
  type NewProductVariant,
  type ProductImage,
  type NewProductImage,
  type ProductSpec,
  type NewProductSpec,
  type ProductStatus,
} from './products'

// ─── Orders ───────────────────────────────────────────────────────────────────────────────
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

// ─── Chat & CRM ───────────────────────────────────────────────────────────────────────────
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
