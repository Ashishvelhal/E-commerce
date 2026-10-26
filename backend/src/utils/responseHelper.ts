import { Response } from 'express';

export interface FieldValidationRule {
  field: string;
  label?: string;
  type?: 'string' | 'number' | 'array' | 'boolean' | 'email';
  min?: number;
  max?: number;
  customValidator?: (val: any) => boolean;
  customErrorMessage?: string;
}

export interface ValidationFailure {
  isValid: boolean;
  missingFields: string[];
  fieldErrors: Record<string, string>;
  summaryMessage: string;
  actionableSuggestion?: string;
}

/**
 * Validates request payload against required fields and type/range constraints.
 */
export const validatePayload = (
  body: Record<string, any>,
  rules: FieldValidationRule[]
): ValidationFailure => {
  const missingFields: string[] = [];
  const fieldErrors: Record<string, string> = {};

  rules.forEach((rule) => {
    const val = body ? body[rule.field] : undefined;
    const label = rule.label || rule.field;

    // Check presence
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missingFields.push(rule.field);
      fieldErrors[rule.field] = rule.customErrorMessage || `${label} is required and cannot be empty.`;
      return;
    }

    // Check array non-empty
    if (rule.type === 'array') {
      if (!Array.isArray(val) || val.length === 0) {
        missingFields.push(rule.field);
        fieldErrors[rule.field] = rule.customErrorMessage || `${label} must be a non-empty list.`;
        return;
      }
    }

    // Check number validity & bounds
    if (rule.type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        fieldErrors[rule.field] = `${label} must be a valid number.`;
        return;
      }
      if (rule.min !== undefined && num < rule.min) {
        fieldErrors[rule.field] = `${label} must be at least ${rule.min}. (Received: ${num})`;
        return;
      }
      if (rule.max !== undefined && num > rule.max) {
        fieldErrors[rule.field] = `${label} cannot exceed ${rule.max}. (Received: ${num})`;
        return;
      }
    }

    // Check string bounds
    if (rule.type === 'string' && typeof val === 'string') {
      if (rule.min !== undefined && val.trim().length < rule.min) {
        fieldErrors[rule.field] = `${label} must be at least ${rule.min} characters long.`;
        return;
      }
      if (rule.max !== undefined && val.trim().length > rule.max) {
        fieldErrors[rule.field] = `${label} cannot exceed ${rule.max} characters.`;
        return;
      }
    }

    // Check email format
    if (rule.type === 'email' && typeof val === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val.trim())) {
        fieldErrors[rule.field] = `Please provide a valid email format for ${label} (e.g. name@domain.com).`;
        return;
      }
    }

    // Custom Validator
    if (rule.customValidator && !rule.customValidator(val)) {
      fieldErrors[rule.field] = rule.customErrorMessage || `${label} provided is invalid.`;
    }
  });

  const errorCount = Object.keys(fieldErrors).length;
  const isValid = errorCount === 0;

  let summaryMessage = 'Validation successful';
  let actionableSuggestion = undefined;

  if (!isValid) {
    if (missingFields.length > 0) {
      summaryMessage = `Missing ${missingFields.length} required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`;
      actionableSuggestion = `Please provide values for: [${missingFields.map((f) => `"${f}"`).join(', ')}] in your request body.`;
    } else {
      const firstField = Object.keys(fieldErrors)[0];
      summaryMessage = `Invalid input: ${fieldErrors[firstField]}`;
      actionableSuggestion = `Please review and fix the highlighted field${errorCount > 1 ? 's' : ''}.`;
    }
  }

  return {
    isValid,
    missingFields,
    fieldErrors,
    summaryMessage,
    actionableSuggestion,
  };
};

/**
 * Standard HTTP 400 Bad Request / Validation Error Response
 */
export const sendValidationError = (
  res: Response,
  options: {
    message?: string;
    missingFields?: string[];
    fieldErrors?: Record<string, string>;
    actionableSuggestion?: string;
    code?: string;
  }
): void => {
  const {
    message = 'Validation failed. Please verify the submitted fields.',
    missingFields = [],
    fieldErrors = {},
    actionableSuggestion,
    code = 'VALIDATION_ERROR',
  } = options;

  res.status(400).json({
    success: false,
    code,
    message,
    missingFields,
    fieldErrors,
    suggestion: actionableSuggestion || (missingFields.length > 0 ? `Please provide: ${missingFields.join(', ')}` : undefined),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard HTTP 404 Not Found Response
 */
export const sendNotFound = (
  res: Response,
  resourceName: string,
  identifier?: string
): void => {
  const message = identifier
    ? `${resourceName} with identifier "${identifier}" could not be found.`
    : `${resourceName} not found.`;

  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message,
    suggestion: 'Please verify the resource ID or URL parameters and try again.',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard HTTP 400 Bad Request Response
 */
export const sendBadRequest = (
  res: Response,
  message: string,
  extra?: Record<string, any>
): void => {
  res.status(400).json({
    success: false,
    code: 'BAD_REQUEST',
    message,
    ...extra,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard HTTP 401 Unauthorized Response
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Authentication required. Please provide a valid login token.'
): void => {
  res.status(401).json({
    success: false,
    code: 'UNAUTHORIZED',
    message,
    suggestion: 'Your session may have expired. Please log in again to continue.',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard HTTP 403 Forbidden Response
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Access denied. You do not have sufficient permissions for this action.'
): void => {
  res.status(403).json({
    success: false,
    code: 'FORBIDDEN',
    message,
    suggestion: 'Please contact the studio administrator for elevated access.',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Standard HTTP Success Response Helper
 */
export const sendSuccess = (
  res: Response,
  data?: any,
  message?: string,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
