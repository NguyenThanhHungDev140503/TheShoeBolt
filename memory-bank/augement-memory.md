# Project Context
- User is working on an e-commerce shoe website project called TheShoeBolt with clerk authentication module and auth authorization module, requiring comprehensive code reviews against official documentation with focus on security, code quality, error handling, and testing effectiveness.

# Development Preferences
- User prefers detailed technical action plans with root cause analysis, code fixes, unit & integration tests, and Definition of Done for each issue, structured as Markdown files in doc/markdown/ directory with specific naming conventions.
- User requires strict adherence to Clean Architecture with Dependency Rule (Infrastructure → Application → Domain), prefers DDD patterns, and needs detailed architectural analysis with Mermaid diagrams, TypeScript implementations, and migration strategies for NestJS projects.
- User prefers detailed technical analysis of interface design decisions in Clean Architecture context, including impact assessment and optimization recommendations for TypeScript/NestJS patterns.
- User prefers using authenticateRequest over verifyToken for Clerk authentication implementation.

# Testing Requirements
- User requires testing work to strictly follow constraint of only creating/updating test files without modifying any source code logic, must adhere to Clean Architecture and DDD patterns, and prefers detailed reporting of API test failures with mock/stub solutions.
- User requires comprehensive test analysis including unit tests, component tests, E2E tests with Clean Architecture and DDD pattern compliance assessment.
- User prefers renaming Integration Tests to Component Tests when using 100% mocking, moving from test/integration/ to test/component/ directory, and maintaining clear test taxonomy to avoid confusion about test scope in team development.
- When tests fail, determine the root cause: if the test is written incorrectly, fix the test; if the code has issues, fix the code.
- User requires comprehensive test suite execution with detailed analysis of unit tests, component tests, and E2E tests, including code coverage assessment, Clean Architecture/DDD pattern compliance evaluation, and root cause analysis of test failures while maintaining the constraint of not modifying source code logic.

# Reporting & Documentation
- User requires professional report structure without icons and enhanced formatting for technical documentation.
- User requires technical reports in Vietnamese language with specific structure including code citations, test results, challenges/solutions, security/performance impact assessment, and next steps, saved to specific paths like doc/markdown/AuthClerk/ with professional formatting without icons.
- User prefers test reports saved to doc/markdown/AuthClerk/Kế hoạch sữa chữa và cải thiện 2/7/ directory with specific naming conventions.