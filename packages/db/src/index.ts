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
