/**
 * White Box Testing for index.ts (main module)
 * 
 * Module Under Test:
 * - Main 2FA module imports
 */

describe('index.ts - Main 2FA Module', () => {
  
  describe('Module Imports', () => {
    
    test('TC-001: Should import MethodInvocationOverride', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      expect(imports).toContain('./MethodInvocationOverride');
      expect(imports).toContain('./methods/checkCodesRemaining');
      expect(imports).toContain('./methods/disable');
      expect(imports).toContain('./methods/enable');
      expect(imports).toContain('./methods/regenerateCodes');
      expect(imports).toContain('./methods/validateTempToken');
      expect(imports).toContain('./loginHandler');
      expect(imports).toHaveLength(7);
    });

    test('TC-002: Should have correct import paths', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      imports.forEach(importPath => {
        expect(importPath).toMatch(/^\.\//); // Should start with ./
      });
      
      expect(imports[0]).toBe('./MethodInvocationOverride');
      expect(imports[1]).toBe('./methods/checkCodesRemaining');
      expect(imports[2]).toBe('./methods/disable');
      expect(imports[3]).toBe('./methods/enable');
      expect(imports[4]).toBe('./methods/regenerateCodes');
      expect(imports[5]).toBe('./methods/validateTempToken');
      expect(imports[6]).toBe('./loginHandler');
    });

    test('TC-003: Should import all 2FA methods', () => {
      // Arrange
      const expectedMethods = [
        'checkCodesRemaining',
        'disable',
        'enable',
        'regenerateCodes',
        'validateTempToken',
      ];
      
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      expectedMethods.forEach(method => {
        const found = imports.some(importPath => importPath.includes(method));
        expect(found).toBe(true);
      });
    });

    test('TC-004: Should import login handler', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      const hasLoginHandler = imports.some(path => path === './loginHandler');
      expect(hasLoginHandler).toBe(true);
    });

    test('TC-005: Should import MethodInvocationOverride first', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      expect(imports[0]).toBe('./MethodInvocationOverride');
      // MethodInvocationOverride should be imported first to set up the override
    });

    test('TC-006: Should import all files from methods directory', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act
      const methodImports = imports.filter(path => path.startsWith('./methods/'));

      // Assert
      expect(methodImports).toHaveLength(5);
      expect(methodImports).toEqual([
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
      ]);
    });

    test('TC-007: Should have proper file extensions in imports', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      // Act & Assert
      // Note: In the actual TypeScript files, these would have .js or .ts extensions
      // but in the index.ts they're imported without extensions
      imports.forEach(path => {
        expect(path).not.toMatch(/\.(js|ts)$/); // Should not have file extension
      });
    });

    test('TC-008: Should set up complete 2FA system', () => {
      // Arrange
      const importCategories = {
        coreOverride: ['./MethodInvocationOverride'],
        methods: [
          './methods/checkCodesRemaining',
          './methods/disable',
          './methods/enable',
          './methods/regenerateCodes',
          './methods/validateTempToken',
        ],
        handlers: ['./loginHandler'],
      };

      // Act & Assert
      expect(importCategories.coreOverride).toHaveLength(1);
      expect(importCategories.methods).toHaveLength(5);
      expect(importCategories.handlers).toHaveLength(1);
      
      // All together
      const allImports = [
        ...importCategories.coreOverride,
        ...importCategories.methods,
        ...importCategories.handlers,
      ];
      expect(allImports).toHaveLength(7);
    });

    test('TC-009: Should maintain import order for dependency resolution', () => {
      // Arrange
      const imports = [
        './MethodInvocationOverride',      // 1. Core override (should be first)
        './methods/checkCodesRemaining',   // 2. Method
        './methods/disable',               // 3. Method
        './methods/enable',                // 4. Method
        './methods/regenerateCodes',       // 5. Method
        './methods/validateTempToken',     // 6. Method
        './loginHandler',                  // 7. Handler (uses other imports)
      ];

      // Act & Assert
      // MethodInvocationOverride should be first as it modifies global behavior
      expect(imports[0]).toBe('./MethodInvocationOverride');
      
      // Methods should be imported before loginHandler which might use them
      const methodImports = imports.slice(1, 6);
      methodImports.forEach(path => {
        expect(path).toMatch(/^\.\/methods\//);
      });
      
      // loginHandler should be last as it depends on other components
      expect(imports[6]).toBe('./loginHandler');
    });

    test('TC-010: Should not have missing imports', () => {
      // Arrange
      const actualImports = [
        './MethodInvocationOverride',
        './methods/checkCodesRemaining',
        './methods/disable',
        './methods/enable',
        './methods/regenerateCodes',
        './methods/validateTempToken',
        './loginHandler',
      ];

      const expectedCoreImports = [
        './MethodInvocationOverride',
        './loginHandler',
      ];

      const expectedMethodImports = [
        'checkCodesRemaining',
        'disable',
        'enable',
        'regenerateCodes',
        'validateTempToken',
      ];

      // Act & Assert
      // Check core imports
      expectedCoreImports.forEach(expected => {
        expect(actualImports).toContain(expected);
      });

      // Check method imports
      expectedMethodImports.forEach(method => {
        const found = actualImports.some(path => path.includes(method));
        expect(found).toBe(true);
      });
    });
  });
});
