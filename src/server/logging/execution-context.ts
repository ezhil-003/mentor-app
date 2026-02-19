import type { Prisma } from "../../../generated/prisma/client";

export type BusinessEvent = {
  name: string;
  at: string;
  data: Record<string, Prisma.InputJsonValue>;
};

export type ExecutionContextState = {
  meta: {
    requestId: string;
    method: string;
    path: string;
    timestamp: string;
  };
  actor: {
    userId: string | null;
  };
  business: {
    events: BusinessEvent[];
  };
  performance: {
    db_tx_ms: number;
    total_duration_ms: number;
  };
  errors: {
    stage: string;
    message: string;
    at: string;
  }[];
  response: {
    status: number;
  };
};

export const addExecutionBusinessEvent = (
  state: ExecutionContextState,
  name: string,
  data: Record<string, Prisma.InputJsonValue> = {},
) => {
  state.business.events.push({
    name,
    at: new Date().toISOString(),
    data,
  });
};

export const addExecutionPerformance = (
  state: ExecutionContextState,
  delta: Partial<ExecutionContextState["performance"]>,
) => {
  if (delta.db_tx_ms !== undefined) {
    state.performance.db_tx_ms += delta.db_tx_ms;
  }

  if (delta.total_duration_ms !== undefined) {
    state.performance.total_duration_ms = delta.total_duration_ms;
  }
};

export const addExecutionError = (state: ExecutionContextState, stage: string, error: unknown) => {
  state.errors.push({
    stage,
    message: error instanceof Error ? error.message : "Unknown error",
    at: new Date().toISOString(),
  });
};

export const persistExecutionContextLog = async (
  db: {
    systemLog: {
      create: (args: {
        data: {
          requestId: string;
          method: string;
          path: string;
          status: number;
          durationMs: number;
          metadata: Prisma.InputJsonValue;
        };
      }) => Promise<unknown>;
    };
  },
  state: ExecutionContextState,
) => {
  await db.systemLog.create({
    data: {
      requestId: state.meta.requestId,
      method: state.meta.method,
      path: state.meta.path,
      status: state.response.status,
      durationMs: state.performance.total_duration_ms,
      metadata: {
        actor: state.actor,
        business: state.business,
        performance: state.performance,
        errors: state.errors,
      },
    },
  });
};

export const createExecutionContext = (opts: {
  method: string;
  path: string;
  userId: string | null;
}): ExecutionContextState => {
  return {
    meta: {
      requestId: crypto.randomUUID(),
      method: opts.method,
      path: opts.path,
      timestamp: new Date().toISOString(),
    },
    actor: {
      userId: opts.userId,
    },
    business: {
      events: [],
    },
    performance: {
      db_tx_ms: 0,
      total_duration_ms: 0,
    },
    errors: [],
    response: {
      status: 200,
    },
  };
};
