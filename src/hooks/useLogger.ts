import { useMemo } from "react";
import { createLogger, logger, LogLevel } from "../utils/logger";

export const useLogger = (context?: string) => {
  return useMemo(() => {
    if (context) {
      return createLogger(context);
    }
    return {
      error: (message: string, data?: any, error?: Error) =>
        logger.error(message, undefined, data, error),
      warn: (message: string, data?: any) =>
        logger.warn(message, undefined, data),
      info: (message: string, data?: any) =>
        logger.info(message, undefined, data),
      debug: (message: string, data?: any) =>
        logger.debug(message, undefined, data),
      trace: (message: string, data?: any) =>
        logger.trace(message, undefined, data),
      time: (label: string) => logger.time(label, undefined),
      timeEnd: (label: string) => logger.timeEnd(label, undefined),
    };
  }, [context]);
};

export const useComponentLogger = (componentName: string) => {
  return useLogger(componentName);
};

export { LogLevel };
