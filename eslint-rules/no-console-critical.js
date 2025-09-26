/**
 * @fileoverview Disallow console.log/warn/error in critical paths
 * @author Brand Deals MVP
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow console.log/warn/error in critical paths, except console.error in catch blocks',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noConsoleCritical: 'Use log.info/warn/error instead of console.{{method}} in critical paths',
      consoleErrorAllowed: 'console.error is allowed in catch blocks when followed by throw or error return',
    },
  },

  create(context) {
    // Critical path patterns
    const criticalPatterns = [
      'src/app/api/**',
      'src/services/**',
      'src/lib/jobs/**',
      'src/services/brandRun/**'
    ];

    // Check if current file is in critical path
    function isCriticalPath(filename) {
      return criticalPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
        return regex.test(filename);
      });
    }

    // Check if console.error is in a catch block followed by throw or error return
    function isConsoleErrorInCatch(node) {
      // Find the nearest catch block
      let parent = node.parent;
      while (parent) {
        if (parent.type === 'CatchClause') {
          // Check if the console.error is followed by throw or error return
          const block = parent.body;
          if (block && block.type === 'BlockStatement') {
            const statements = block.body;
            const errorIndex = statements.findIndex(stmt => stmt === node);
            
            // Look for throw or error return after this console.error
            for (let i = errorIndex + 1; i < statements.length; i++) {
              const stmt = statements[i];
              if (stmt.type === 'ThrowStatement' || 
                  (stmt.type === 'ReturnStatement' && 
                   stmt.argument && 
                   ((stmt.argument.type === 'Identifier' && stmt.argument.name === 'error') ||
                    (stmt.argument.type === 'ObjectExpression' && 
                     stmt.argument.properties && stmt.argument.properties.some(prop => 
                       prop.key && prop.key.name === 'error'
                     ))))) {
                return true;
              }
            }
          }
          break;
        }
        parent = parent.parent;
      }
      return false;
    }

    return {
      CallExpression(node) {
        // Check if it's a console method call
        if (node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'console' &&
            node.callee.property.type === 'Identifier') {
          
          const method = node.callee.property.name;
          
          // Only check console.log, console.warn, console.error
          if (['log', 'warn', 'error'].includes(method)) {
            const filename = context.getFilename();
            
            // Check if file is in critical path
            if (isCriticalPath(filename)) {
              // Special case: console.error in catch blocks followed by throw/error return
              if (method === 'error' && isConsoleErrorInCatch(node)) {
                context.report({
                  node,
                  messageId: 'consoleErrorAllowed',
                });
                return;
              }
              
              // Report violation
              context.report({
                node,
                messageId: 'noConsoleCritical',
                data: {
                  method: method,
                },
              });
            }
          }
        }
      },
    };
  },
};
