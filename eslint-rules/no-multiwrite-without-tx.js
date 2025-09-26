/**
 * ESLint rule to detect multiple Prisma write operations without transaction
 * 
 * This rule flags functions that contain 2+ prisma.<model>.(create|update|delete|upsert)
 * calls without a sibling $transaction call.
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect multiple Prisma write operations without transaction',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      multiWriteWithoutTx: 'Multiple Prisma write operations detected without transaction. Wrap with tx() helper.',
    },
  },

  create(context) {
    let prismaWriteCount = 0
    let hasTransaction = false
    let functionDepth = 0
    let inTransaction = false

    const writeOperations = [
      'create',
      'update', 
      'delete',
      'upsert',
      'createMany',
      'updateMany',
      'deleteMany'
    ]

    const transactionMethods = [
      '$transaction',
      'tx'
    ]

    function enterFunction() {
      functionDepth++
      if (functionDepth === 1) {
        // Reset counters for new top-level function
        prismaWriteCount = 0
        hasTransaction = false
        inTransaction = false
      }
    }

    function exitFunction() {
      functionDepth--
      if (functionDepth === 0) {
        // Check if we have multiple writes without transaction
        if (prismaWriteCount >= 2 && !hasTransaction) {
          context.report({
            node: context.getSourceCode().ast,
            messageId: 'multiWriteWithoutTx',
          })
        }
      }
    }

    function checkCallExpression(node) {
      if (functionDepth === 0) return

      // Check if it's a Prisma write operation
      if (
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object &&
        node.callee.object.type === 'MemberExpression' &&
        node.callee.object.object &&
        node.callee.object.object.name === 'prisma' &&
        writeOperations.includes(node.callee.property.name)
      ) {
        if (!inTransaction) {
          prismaWriteCount++
        }
      }

      // Check if it's a transaction call
      if (
        node.callee &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object &&
        node.callee.object.name === 'prisma' &&
        node.callee.property.name === '$transaction'
      ) {
        hasTransaction = true
        inTransaction = true
      }

      // Check if it's a tx() helper call
      if (
        node.callee &&
        node.callee.name === 'tx'
      ) {
        hasTransaction = true
        inTransaction = true
      }
    }

    function checkAwaitExpression(node) {
      if (functionDepth === 0) return

      // Check if it's awaiting a transaction
      if (
        node.argument &&
        node.argument.type === 'CallExpression' &&
        node.argument.callee &&
        node.argument.callee.type === 'MemberExpression' &&
        node.argument.callee.object &&
        node.argument.callee.object.name === 'prisma' &&
        node.argument.callee.property.name === '$transaction'
      ) {
        hasTransaction = true
        inTransaction = true
      }

      // Check if it's awaiting tx() helper
      if (
        node.argument &&
        node.argument.type === 'CallExpression' &&
        node.argument.callee &&
        node.argument.callee.name === 'tx'
      ) {
        hasTransaction = true
        inTransaction = true
      }
    }

    function checkArrowFunction(node) {
      if (node.parent && node.parent.type === 'CallExpression') {
        const parentCall = node.parent
        if (
          parentCall.callee &&
          parentCall.callee.type === 'MemberExpression' &&
          parentCall.callee.object &&
          parentCall.callee.object.name === 'prisma' &&
          parentCall.callee.property.name === '$transaction'
        ) {
          inTransaction = true
        }
        if (
          parentCall.callee &&
          parentCall.callee.name === 'tx'
        ) {
          inTransaction = true
        }
      }
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: (node) => {
        enterFunction()
        checkArrowFunction(node)
      },
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,
      CallExpression: checkCallExpression,
      AwaitExpression: checkAwaitExpression,
    }
  },
}
