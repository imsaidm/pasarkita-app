export {
  ROLES,
  SESSION_KINDS,
  SessionError,
  issue,
  parseSession,
  readSecret,
  verify,
  type Role,
  type Session,
  type SessionKind,
} from './session';

export {
  DEMO_FORBIDDEN,
  DEMO_SESSION_TTL_MS,
  DEMO_TENANT_PREFIX,
  DemoError,
  assertDemoSessionSane,
  createDemoSession,
  demoPlan,
  demoTenantIdFor,
  isDemoTenantId,
  type ForbiddenAction,
} from './demo';

export {
  PasswordError,
  assertPasswordAcceptable,
  hashPassword,
  verifyPassword,
} from './password';

export {
  COOKIE_NAME,
  clearCookie,
  readSession,
  serializeCookie,
  type CookieOptions,
} from './cookie';

export {
  ForbiddenError,
  assertActionAllowed,
  assertHasApp,
  assertHasFeature,
  assertOwnsTenant,
  assertSessionUsable,
  guard,
  isForbiddenForDemo,
  type GuardInput,
} from './guard';
