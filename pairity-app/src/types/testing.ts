export interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
  bio: string;
  photos: string[];
  location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  preferences: {
    ageRange: [number, number];
    distance: number;
    interestedIn: 'men' | 'women' | 'both';
  };
  interests: string[];
  verified: boolean;
  premium: boolean;
}

export interface TestMatch {
  id: string;
  user1Id: string;
  user2Id: string;
  matchedAt: string;
  chatId?: string;
  isSuperLike: boolean;
}

export interface TestMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'gif' | 'location';
  timestamp: string;
  readAt?: string;
  reactions?: TestReaction[];
  replyTo?: string;
}

export interface TestReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface TestChat {
  id: string;
  participants: string[];
  lastMessage?: TestMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestSwipe {
  id: string;
  swiperId: string;
  swipedId: string;
  action: 'like' | 'dislike' | 'superlike';
  timestamp: string;
}

export interface MockApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TestScenario {
  name: string;
  description: string;
  setup: () => void;
  teardown?: () => void;
  users?: TestUser[];
  matches?: TestMatch[];
  messages?: TestMessage[];
}

export interface ComponentTestProps {
  testID?: string;
  mockProps?: Record<string, any>;
  navigationMock?: any;
  storeMock?: any;
}

export interface IntegrationTestFlow {
  name: string;
  steps: TestStep[];
  expectedResults: ExpectedResult[];
}

export interface TestStep {
  action: 'tap' | 'swipe' | 'input' | 'navigate' | 'wait' | 'scroll';
  target: string;
  value?: string | number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export interface ExpectedResult {
  type: 'element_visible' | 'element_hidden' | 'text_present' | 'navigation' | 'api_call';
  target?: string;
  value?: string;
  timeout?: number;
}

export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  frameDrops: number;
  networkCalls: number;
  bundleSize: number;
}

export interface AccessibilityTestResult {
  component: string;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  passed: boolean;
  score: number;
}

export interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  element: string;
  suggestion: string;
}

export interface AccessibilityWarning {
  rule: string;
  description: string;
  element: string;
  suggestion?: string;
}

export interface TestConfig {
  timeout: number;
  retries: number;
  slowMo: number;
  headless: boolean;
  viewport: {
    width: number;
    height: number;
  };
  device: 'ios' | 'android';
  platform: 'simulator' | 'device';
}

export interface MockService {
  name: string;
  baseUrl: string;
  routes: MockRoute[];
  middleware?: MockMiddleware[];
}

export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  response: any;
  status?: number;
  delay?: number;
  condition?: (req: any) => boolean;
}

export interface MockMiddleware {
  name: string;
  handler: (req: any, res: any, next: () => void) => void;
}

export interface TestReport {
  summary: TestSummary;
  suites: TestSuiteResult[];
  coverage: CoverageReport;
  performance: PerformanceReport;
  accessibility: AccessibilityReport;
  timestamp: string;
  duration: number;
}

export interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  passRate: number;
}

export interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  duration: number;
  passed: boolean;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  retries: number;
}

export interface CoverageReport {
  lines: CoverageMetric;
  functions: CoverageMetric;
  branches: CoverageMetric;
  statements: CoverageMetric;
}

export interface CoverageMetric {
  total: number;
  covered: number;
  percentage: number;
}

export interface PerformanceReport {
  averageRenderTime: number;
  memoryLeaks: MemoryLeak[];
  slowQueries: SlowQuery[];
  bundleAnalysis: BundleAnalysis;
}

export interface MemoryLeak {
  component: string;
  leakSize: number;
  description: string;
}

export interface SlowQuery {
  query: string;
  duration: number;
  component: string;
}

export interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  duplicates: DuplicateModule[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  percentage: number;
}

export interface DuplicateModule {
  name: string;
  occurrences: number;
  totalSize: number;
}

export interface AccessibilityReport {
  overallScore: number;
  violations: AccessibilityViolation[];
  warnings: AccessibilityWarning[];
  testedComponents: string[];
}

export interface E2ETestCase {
  name: string;
  description: string;
  platform: 'ios' | 'android' | 'both';
  steps: E2EStep[];
  assertions: E2EAssertion[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface E2EStep {
  description: string;
  action: E2EAction;
  element: string;
  value?: any;
  timeout?: number;
}

export interface E2EAction {
  type: 'tap' | 'type' | 'swipe' | 'scroll' | 'wait' | 'screenshot';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  coordinates?: { x: number; y: number };
}

export interface E2EAssertion {
  type: 'visible' | 'notVisible' | 'text' | 'count' | 'attribute';
  element: string;
  expected: any;
  timeout?: number;
}