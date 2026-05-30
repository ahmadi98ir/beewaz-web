// ─── Users ──────────────────────────────────────────────────────────────────
export { userRoleEnum, users, type User, type NewUser, type UserRole } from './users'

// ─── Categories ──────────────────────────────────────────────────────────────
export {
  categories, categoriesRelations,
  type Category, type NewCategory,
} from './categories'

// ─── Products ────────────────────────────────────────────────────────────────
export {
  productStatusEnum, products, productVariants, productImages, productSpecs,
  productsRelations, productVariantsRelations, productImagesRelations, productSpecsRelations,
  type Product, type NewProduct, type ProductVariant, type NewProductVariant,
  type ProductImage, type NewProductImage, type ProductSpec, type NewProductSpec,
  type ProductStatus,
} from './products'

// ─── Orders ──────────────────────────────────────────────────────────────────
export {
  orderStatusEnum, paymentMethodEnum, orderNoteTypeEnum, orders, orderItems, orderNotes,
  ordersRelations, orderItemsRelations, orderNotesRelations,
  type Order, type NewOrder, type OrderStatus, type OrderItem, type NewOrderItem,
  type OrderNote, type NewOrderNote, type OrderNoteType,
} from './orders'

// ─── Articles ────────────────────────────────────────────────────────────────
export {
  articleStatusEnum, articles,
  type Article, type NewArticle, type ArticleStatus,
} from './articles'

// ─── Chat & CRM ──────────────────────────────────────────────────────────────
export {
  sessionStatusEnum, messageRoleEnum, leadStatusEnum,
  chatSessions, chatMessages, leads,
  chatSessionsRelations, chatMessagesRelations, leadsRelations,
  type ChatSession, type NewChatSession, type ChatMessage, type NewChatMessage,
  type Lead, type NewLead, type LeadStatus,
} from './chat'

// ─── OTP ─────────────────────────────────────────────────────────────────────
export { phoneOtps, type PhoneOtp, type NewPhoneOtp } from './otp'

// ─── CMS ─────────────────────────────────────────────────────────────────────
export {
  contentTypeEnum, siteSettings, pageContent, pageViews,
  type SiteSetting, type NewSiteSetting,
  type PageContent, type NewPageContent,
  type PageView, type NewPageView,
} from './cms'

// ─── CMS Pages + Banners ─────────────────────────────────────────────────────
export {
  pages, banners,
  type Page, type NewPage,
  type Banner, type NewBanner,
  type Block, type BlockType,
} from './pages'

// ─── Coupons ─────────────────────────────────────────────────────────────────
export {
  couponTypeEnum, coupons, couponUsages,
  couponsRelations, couponUsagesRelations,
  type Coupon, type NewCoupon, type CouponType, type CouponUsage,
} from './coupons'

// ─── CRM Extended ────────────────────────────────────────────────────────────
export {
  leadNotes, leadActivities, followUps, customerNotes,
  leadNotesRelations, leadActivitiesRelations, followUpsRelations, customerNotesRelations,
  type LeadNote, type NewLeadNote,
  type LeadActivity, type NewLeadActivity,
  type FollowUp, type NewFollowUp,
  type CustomerNote, type NewCustomerNote,
} from './crm'
