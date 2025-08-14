# TypeScript Configuration

## Overview
The Pairity React Native application is configured with TypeScript in strict mode for enhanced type safety and developer experience.

## Configuration Details

### TypeScript Configuration (tsconfig.json)
The project uses TypeScript with the following key configurations:

- **Strict Mode**: Fully enabled with all strict checks
  - `strict: true`
  - `strictNullChecks: true`
  - `strictFunctionTypes: true`
  - `strictBindCallApply: true`
  - `strictPropertyInitialization: true`
  - `noImplicitThis: true`
  - `alwaysStrict: true`

- **Additional Type Checking**:
  - `noUnusedLocals: true` - Warns about unused local variables
  - `noUnusedParameters: true` - Warns about unused function parameters
  - `noImplicitReturns: true` - Ensures all code paths return a value
  - `noFallthroughCasesInSwitch: true` - Prevents fallthrough in switch statements

### Path Aliases
The project is configured with path aliases for cleaner imports:

```typescript
// Instead of:
import Component from '../../../components/Component';

// You can use:
import Component from '@components/Component';
```

Available aliases:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@screens/*` → `src/screens/*`
- `@navigation/*` → `src/navigation/*`
- `@services/*` → `src/services/*`
- `@store/*` → `src/store/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`
- `@assets/*` → `assets/*`

### Babel Configuration
The babel configuration includes the `module-resolver` plugin to support path aliases at runtime:

```javascript
['module-resolver', {
  root: ['./src'],
  alias: {
    '@': './src',
    '@components': './src/components',
    // ... other aliases
  }
}]
```

## Type Definitions

### Environment Variables
Environment variables are strongly typed in `types/env.d.ts`:

```typescript
declare module '@env' {
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string;
  // ... other environment variables
}
```

## Development Commands

### Type Checking
Run TypeScript type checking without emitting files:
```bash
npm run type-check
```

### Linting
The project uses ESLint with TypeScript support:
```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix linting issues
```

### Formatting
Prettier is configured for consistent code formatting:
```bash
npm run format
```

## Best Practices

1. **Always use strict types**: Avoid `any` type unless absolutely necessary
2. **Define interfaces for props**: All component props should have interfaces
3. **Use path aliases**: Import using path aliases for cleaner code
4. **Type safety first**: Leverage TypeScript's type system for safer code
5. **Return types**: While not enforced, consider adding explicit return types for complex functions

## Example Component with TypeScript

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  title: string;
  subtitle?: string;  // Optional prop
  onPress: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, subtitle, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
      {subtitle && <Text>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default Component;
```

## Troubleshooting

### Path Aliases Not Working
1. Ensure both `tsconfig.json` and `babel.config.js` have matching aliases
2. Restart the Metro bundler after configuration changes
3. Clear Metro cache: `npx expo start -c`

### TypeScript Errors
1. Run `npm run type-check` to see all TypeScript errors
2. Check that all dependencies have type definitions
3. Install missing type definitions: `npm install --save-dev @types/package-name`

## Additional Resources
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Native TypeScript Guide](https://reactnative.dev/docs/typescript)
- [Expo TypeScript Guide](https://docs.expo.dev/guides/typescript/)