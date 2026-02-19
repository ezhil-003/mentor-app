import type { Prisma } from "../../../generated/prisma/client";
import type { ExecutionContextState } from "@/server/logging/execution-context";
import { addExecutionPerformance } from "@/server/logging/execution-context";

type TransactionExecutor = {
  $transaction: <T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) => Promise<T>;
};

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
