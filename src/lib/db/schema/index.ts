// ─── Users ────────────────────────────────────────────────────────────────────
export {
  userRoleEnum,
  users,
  usersRelations,
  type User,
  type NewUser,
  type UserRole,
} from './users'

// ─── Categories ───────────────────────────────────────────────────────────────
export {
  categories,
  categoriesRelations,
  type Category,
  type NewCategory,
} from './categories'

// ─── Products ─────────────────────────────────────────────────────────────────
export {
  productStatusEnum,
  products,
  productImages,
  productSpecs,
  productsRelations,
  productImagesRelations,
  productSpecsRelations,
  type Product,
  type NewProduct,
  type ProductStatus,
  type ProductImage,
  type NewProductImage,
  type ProductSpec,
  type NewProductSpec,
  type ProductWithDetails,
} from './products'

// ─── Orders ───────────────────────────────────────────────────────────────────
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

// ─── Articles ─────────────────────────────────────────────────────────────────
export {
  articleCategoryEnum,
  articleStatusEnum,
  articles,
  articlesRelations,
  type Article,
  type NewArticle,
  type ArticleCategory,
  type ArticleStatus,
} from './articles'

// ─── Chat & CRM ───────────────────────────────────────────────────────────────
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

// ─── CMS ──────────────────────────────────────────────────────────────────────
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
