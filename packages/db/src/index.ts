export {
  DbError,
  closePool,
  getPool,
  query,
  queryOne,
  transaction,
  type Row,
} from './client';

export {
  countSkus,
  listCatalog,
  loadTenantPlan,
  recordSale,
  type CatalogItem,
} from './queries';

export {
  closeShift,
  findOpenShift,
  openShift,
  recordPosSale,
  summariseShift,
  type SaleInput,
  type SaleResult,
  type Shift,
  type ShiftSummary,
} from './pos';

export {
  findCategoryBySlug,
  findProductBySlug,
  listBestSellers,
  listCategories,
  listNewestProducts,
  listProducts,
  searchProducts,
  slugify,
  type StorefrontCategory,
  type StorefrontProduct,
  type StorefrontVariantGroup,
} from './storefront';
export {
  findOrderById,
  listStoreOrders,
  recordStoreOrder,
  type OrderItemRead,
  type OrderRead,
  type OrderStatus,
  type StoreOrderInput,
} from './orders-read';