import type { Prisma } from "../../../generated/prisma/client";
import type { ExecutionContextState } from "@/server/logging/execution-context";
import { addExecutionPerformance } from "@/server/logging/execution-context";

type TransactionExecutor = {
  $transaction: <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>;
};

/**
 * This function is used to run a transaction.
 * It uses the $transaction method to run the transaction.
 * @param db - The database client.
 * @param executionContext - The execution context.
 * @param callback - The callback function.
 * @returns The result of the transaction.
 */

export const runTrackedTransaction = async <T>(
  db: TransactionExecutor,
  executionContext: ExecutionContextState,
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> => {
  const startedAt = Date.now();

  try {
    return await db.$transaction(async (tx) => {
      return callback(tx);
    });
  } finally {
    addExecutionPerformance(executionContext, {
      db_tx_ms: Date.now() - startedAt,
    });
  }
};
