// ─── Users ──────────────────────────────────────────────────────────────────
export {
  users, type User, type NewUser, type UserRole,
  type CustomerType, type BillingInfo,
} from './users'

// ─── Categories ──────────────────────────────────────────────────────────────
export {
  categories, categoriesRelations,
  type Category, type NewCategory,
} from './categories'

// ─── Products ────────────────────────────────────────────────────────────────
export {
  productStatusEnum, products, productVariants, productImages, productSpecs, productReviews,
  productsRelations, productVariantsRelations, productImagesRelations, productSpecsRelations,
  type Product, type NewProduct, type ProductVariant, type NewProductVariant,
  type ProductImage, type NewProductImage, type ProductSpec, type NewProductSpec,
  type ProductStatus, type ProductReview, type NewProductReview,
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

// ─── RBAC ────────────────────────────────────────────────────────────────────
export {
  roles, permissions, rolePermissions,
  type Role, type NewRole, type Permission, type RolePermission,
} from './rbac'

// ─── Coupons ─────────────────────────────────────────────────────────────────
export {
  couponTypeEnum, coupons, couponUsages,
  couponsRelations, couponUsagesRelations,
  type Coupon, type NewCoupon, type CouponType, type CouponUsage,
} from './coupons'

// ─── Audit Log ───────────────────────────────────────────────────────────────
export { adminAuditLogs, type AdminAuditLog, type NewAdminAuditLog } from './audit'

// ─── CRM Extended ────────────────────────────────────────────────────────────
export {
  leadNotes, leadActivities, followUps, customerNotes,
  leadNotesRelations, leadActivitiesRelations, followUpsRelations, customerNotesRelations,
  type LeadNote, type NewLeadNote,
  type LeadActivity, type NewLeadActivity,
  type FollowUp, type NewFollowUp,
  type CustomerNote, type NewCustomerNote,
} from './crm'

// ─── Attributes (Product Variants) ───────────────────────────────────────────
export {
  productAttributeTypes, productAttributeValues, productVariantOptions, productAttributeTypeAssignments,
  attributeTypesRelations, attributeValuesRelations, variantOptionsRelations,
  type ProductAttributeType, type ProductAttributeValue, type ProductVariantOption,
} from './attributes'

// ─── Inventory ────────────────────────────────────────────────────────────────
export {
  inventoryTxTypeEnum, inventoryTransactions, lowStockAlerts,
  inventoryTransactionsRelations,
  type InventoryTransaction, type NewInventoryTransaction, type InventoryTxType, type LowStockAlert,
} from './inventory'

// ─── Locations ───────────────────────────────────────────────────────────────
export {
  provinces, cities, provincesRelations, citiesRelations,
  type Province, type City,
} from './locations'

// ─── SMS Logs ─────────────────────────────────────────────────────────────────
export {
  smsStatusEnum, smsTriggerEnum, smsLogs, smsLogsRelations,
  type SmsLog, type NewSmsLog, type SmsStatus, type SmsTrigger,
} from './sms-logs'

// ─── Returns (RMA) ────────────────────────────────────────────────────────────
export {
  returnReasonEnum, returnStatusEnum, returnRequests, returnRequestsRelations,
  type ReturnRequest, type NewReturnRequest, type ReturnReason, type ReturnStatus,
} from './returns'

// ─── Order Billing Details ────────────────────────────────────────────────────
export {
  orderBillingDetails, orderBillingDetailsRelations,
  type OrderBillingDetails, type NewOrderBillingDetails,
} from './billing-details'

// ─── Analytics ────────────────────────────────────────────────────────────────
export {
  productViews, cartAbandonmentSessions, analyticsDailySnapshots,
  productViewsRelations, cartAbandonmentRelations,
  type ProductView, type CartAbandonmentSession, type NewCartAbandonmentSession,
  type AnalyticsDailySnapshot,
} from './analytics'

// ─── Warranties ───────────────────────────────────────────────────────────────
export {
  serialStatusEnum, warrantyStatusEnum, productSerials, warranties,
  productSerialsRelations, warrantiesRelations,
  type ProductSerial, type Warranty,
} from './warranties'

// ─── Menu (CMS) ───────────────────────────────────────────────────────────────
export {
  menuItems,
  type MenuItem, type NewMenuItem,
} from './menu'

// ─── Wishlist ─────────────────────────────────────────────────────────────────
export {
  wishlistItems, wishlistItemsRelations,
  type WishlistItem, type NewWishlistItem,
} from './wishlist'

// ─── دفترچه آدرس ───────────────────────────────────────────────────────────────
export {
  userAddresses, userAddressesRelations,
  type UserAddress, type NewUserAddress,
} from './addresses'
