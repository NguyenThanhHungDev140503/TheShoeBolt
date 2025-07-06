# Project Context
- User is working on an e-commerce shoe website project called TheShoeBolt with clerk authentication module and auth authorization module, requiring comprehensive code reviews against official documentation with focus on security, code quality, error handling, and testing effectiveness.

# Development Preferences
- User prefers detailed technical action plans with root cause analysis, code fixes, unit & integration tests, and Definition of Done for each issue, structured as Markdown files in doc/markdown/ directory with specific naming conventions.
- User requires strict adherence to Clean Architecture with Dependency Rule (Infrastructure → Application → Domain), prefers DDD patterns, and needs detailed architectural analysis with Mermaid diagrams, TypeScript implementations, and migration strategies for NestJS projects.
- User prefers detailed technical analysis of interface design decisions in Clean Architecture context, including impact assessment and optimization recommendations for TypeScript/NestJS patterns.
- User prefers using authenticateRequest over verifyToken for Clerk authentication implementation.
- User requires strict adherence to implementation plans - if any errors occur during code deployment that prevent implementation, must stop and notify user immediately without deviating from plan, and if any code logic errors are found during testing, must stop immediately and notify user without deviating from plan.
- User prefers strict Clean Architecture compliance and is concerned about domain layer depending on infrastructure layer through clerkId usage in users.service.ts.
- User believes Infrastructure layer depending on Application/Domain layers is not a Clean Architecture violation and questions this interpretation of Dependency Rule.
- User questions why importing Application layer Guards and Decorators from Infrastructure layer is considered a Clean Architecture violation, suggesting they may interpret the Dependency Rule differently.
- User requires comprehensive Clean Architecture Dependency Rule compliance checks focusing on layer dependencies (Infrastructure → Application → Domain), DDD pattern violations, and special attention to authentication/authorization modules with Clerk integration.
- User requires Clean Architecture compliance checks for Infrastructure layer focusing on Clerk module, detecting direct Domain Entity imports/usage violations, requiring reports saved to doc/markdown/AuthClerk/Kế hoạch sữa chữa và cải thiện 2/7 with code citations, violation severity assessment, and DTO-based solutions.
- User prefers controllers to throw explicit/clear errors rather than passing invalid data (like undefined) to service layer.
- User wants to understand differences between NestJS testing approaches: inline mock objects vs jest.spyOn() for service mocking, and which approach is recommended for controller testing.
- User prefers simplified error handling in source code (not test code) that throws just enough error information for Jest to recognize while keeping terminal logs clean and concise.

# Testing Requirements
- User requires testing work to strictly follow constraint of only creating/updating test files without modifying any source code logic, must adhere to Clean Architecture and DDD patterns, and prefers detailed reporting of API test failures with mock/stub solutions.
- User requires comprehensive test analysis including unit tests, component tests, E2E tests with Clean Architecture and DDD pattern compliance assessment.
- User prefers renaming Integration Tests to Component Tests when using 100% mocking, moving from test/integration/ to test/component/ directory, and maintaining clear test taxonomy to avoid confusion about test scope in team development.
- When tests fail, determine the root cause: if the test is written incorrectly, fix the test; if the code has issues, fix the code.
- User requires comprehensive test suite execution with detailed analysis of unit tests, component tests, and E2E tests, including code coverage assessment, Clean Architecture/DDD pattern compliance evaluation, and root cause analysis of test failures while maintaining the constraint of not modifying source code logic.
- User requires test Phase execution workflow: analyze official docs, check codebase structure, execute tests, analyze results with root cause analysis, and update reports with detailed code citations, test results, and architectural compliance assessment in Vietnamese without icons.
- User requires Test Phase workflow for improving test coverage: analyze current state, identify gaps, implement improvements (unit tests for uncovered functions, component tests for complex workflows), maintain constraint of only creating/updating test files without modifying any source code logic, prioritize security-critical modules and authentication/authorization workflows, with urgent notification for any code logic errors found.
- User prefers adding Phase 2 test cases directly to existing test files instead of creating separate test files for each phase.
- User prefers simplified error handling in test code that throws just enough error information for Jest to recognize while keeping terminal logs clean and concise.
- User is concerned about maintaining debugging capabilities when suppressing console error logs in tests and wants to balance clean terminal output with debugging needs.
- User prefers running tests one file at a time when logs are too long to read effectively.
- User requires comprehensive test evaluation workflow with 4 specific steps: plan compliance check, coverage analysis, improvement recommendations, and detailed Vietnamese reporting saved to doc/markdown/AuthClerk/Kế hoạch sữa chữa và cải thiện 2/7/ directory with constraint of only creating/updating test files without modifying source code logic.

# Reporting & Documentation
- User requires professional report structure without icons and enhanced formatting for technical documentation.
- User requires technical reports in Vietnamese language with specific structure including code citations, test results, challenges/solutions, security/performance impact assessment, and next steps, saved to specific paths like doc/markdown/AuthClerk/ with professional formatting without icons.
- User prefers test reports saved to doc/markdown/AuthClerk/Kế hoạch sữa chữa và cải thiện 2/7/ directory with specific naming conventions.