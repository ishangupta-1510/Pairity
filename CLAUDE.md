# CLAUDE.md - Claude Code Instructions

## Project Overview
This is the Pairity application project. This document contains important instructions and guidelines for Claude Code when working on this codebase.

## Development Guidelines

### Code Style
- **Write code as an expert developer**: Always produce production-ready, professional-grade code
- Follow industry best practices and design patterns
- Write clean, maintainable, and scalable code with proper abstractions
- Use meaningful variable and function names that clearly express intent
- Apply SOLID principles where appropriate
- Implement proper error handling and edge case management
- Optimize for both readability and performance
- Follow existing code conventions in the project
- Use consistent indentation and formatting
- Maintain clean, readable code structure
- Follow security best practices - never expose or commit secrets

### Testing
- Run tests after implementing new features or fixes
- Verify all changes before marking tasks as complete
- Use appropriate testing frameworks as defined in the project

### File Management
- ALWAYS prefer editing existing files over creating new ones
- Only create new files when absolutely necessary for the task
- Do not create documentation files unless explicitly requested
- **IMPORTANT**: If you create temporary or unnecessary files during implementation, remove them after completing the correct solution
- Clean up any test files, duplicate files, or incorrectly named files that were created during development

### Task Management
- Use the TodoWrite tool to track all major tasks
- Mark tasks as in_progress when starting work
- Mark tasks as completed immediately upon finishing
- Break complex tasks into smaller, manageable steps

### Documentation Requirements
- **IMPORTANT**: ALL major changes MUST be documented in the /docs folder
- Update relevant documentation files immediately after implementing changes
- Create new documentation files in /docs when adding new features or modules
- Documentation should include:
  - Feature descriptions
  - API changes
  - Breaking changes
  - Migration guides (if applicable)
  - Usage examples
- Keep documentation up-to-date and synchronized with code changes
- Use clear, concise language in documentation
- Include code examples where appropriate

## Important Commands
<!-- Add project-specific commands here as discovered -->
### Build Commands
- TBD: Add build command once identified

### Test Commands
- TBD: Add test command once identified

### Lint/Type Check Commands
- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Major Changes Log
This section documents all major changes made to the codebase. Each entry should include:
- Date
- Description of change
- Files affected
- Any breaking changes or important notes

### Change History

#### 2025-08-14
- **Prompt 07: User Discovery & Listing Complete**: Implemented user discovery system
  - Files: DiscoverScreen.tsx, UserCardGrid.tsx, UserCardList.tsx, UserCardStack.tsx, FilterModal.tsx, SearchBar.tsx, discover.ts (types)
  - Created documentation: docs/prompt-07-user-listing-implementation.md  
  - Notes: Three view modes, comprehensive filtering, swipe gestures, search, and sorting

#### 2025-08-14
- **Prompt 06: Settings Screen Complete**: Implemented comprehensive settings system
  - Files: EnhancedSettingsScreen.tsx, CustomSwitch.tsx, CustomSlider.tsx, SectionHeader.tsx, SettingItem.tsx, BlockListScreen.tsx, ChangePasswordScreen.tsx
  - Created documentation: docs/prompt-06-settings-implementation.md
  - Notes: Full settings management with search, undo, animations, and all required sections

#### 2025-08-14
- **Cleanup: Removed unused root-level /src folder**: Cleaned up project structure
  - Files: Deleted /src folder (root level)
  - Notes: All active development is in /pairity-app/src; removed duplicate unused folder structure

#### 2025-08-14
- **Prompt 05: User Profile Management Complete**: Implemented comprehensive profile screens
  - Files: ProfileScreen.tsx, EditProfileScreen.tsx, PhotosTab.tsx, BasicInfoTab.tsx, PreferencesTab.tsx, PromptsTab.tsx, CustomPicker.tsx
  - Added dependencies: react-native-image-picker, react-native-draggable-flatlist, react-native-tab-view, react-native-chart-kit
  - Created documentation: docs/prompt-05-user-profile-implementation.md
  - Notes: Full profile management system with photo upload, drag-to-reorder, form validation, auto-save, and profile prompts

#### 2025-08-13
- **TypeScript Configuration Complete**: Set up TypeScript with strict mode and path aliases
  - Files: pairity-app/tsconfig.json, pairity-app/babel.config.js, pairity-app/package.json
  - Added missing dependencies: redux-persist, yup, @types/react-native-vector-icons
  - Created documentation: docs/typescript-configuration.md
  - Notes: Full TypeScript strict mode enabled with comprehensive path aliases for cleaner imports

#### 2025-08-13
- **Created CLAUDE.md**: Initial setup of Claude Code instructions file
  - Files: CLAUDE.md (new)
  - Notes: This file will serve as the reference for Claude Code when working on the Pairity project

<!-- Add new changes above this line -->

## Project-Specific Instructions
<!-- Add any project-specific instructions or requirements here -->

## Dependencies and Frameworks
<!-- Document main dependencies and frameworks used in the project -->

## Architecture Notes
<!-- Add important architecture decisions and patterns used in the project -->

## Common Issues and Solutions
<!-- Document common issues encountered and their solutions -->

## API Endpoints
<!-- Document important API endpoints if applicable -->

## Database Schema
<!-- Document database structure if applicable -->

## Environment Variables
<!-- Document required environment variables -->

## Deployment Notes
<!-- Add deployment-related instructions -->