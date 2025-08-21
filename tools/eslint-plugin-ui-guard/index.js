export default {
  rules: {
    'no-banned-classes': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow banned CSS classes that violate design system',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: null,
        schema: [],
      },
      create(context) {
        const bannedClasses = [
          'border-dashed',
          'outline-dashed', 
          'w-screen',
          'max-w-full',
          'min-w-full',
          'flex-1',
          'grow',
          'basis-full'
        ];

        return {
          JSXAttribute(node) {
            if (node.name.name === 'className') {
              const value = node.value;
              
              if (value && value.type === 'Literal' && typeof value.value === 'string') {
                const classNames = value.value.split(' ');
                
                for (const className of classNames) {
                  if (bannedClasses.includes(className)) {
                    context.report({
                      node,
                      message: `Banned CSS class '${className}' violates design system. Use design system tokens instead.`,
                    });
                  }
                }
              }
            }
          },
          
          // Also check template literals
          TemplateLiteral(node) {
            node.quasis.forEach(quasi => {
              if (quasi.value.raw) {
                const classNames = quasi.value.raw.split(' ');
                
                for (const className of classNames) {
                  if (bannedClasses.includes(className)) {
                    context.report({
                      node,
                      message: `Banned CSS class '${className}' violates design system. Use design system tokens instead.`,
                    });
                  }
                }
              }
            });
          }
        };
      },
    },
  },
};
