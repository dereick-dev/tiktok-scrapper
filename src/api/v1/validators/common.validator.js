<<<<<<< HEAD
class CommonValidator {
  /**
   * Validate pagination parameters
   */
  static validatePagination(page, limit) {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;

    const errors = [];

    if (parsedPage < 1) {
      errors.push({
        field: 'page',
        message: 'Page must be at least 1'
      });
    }

    if (parsedPage > 1000) {
      errors.push({
        field: 'page',
        message: 'Page cannot exceed 1000'
      });
    }

    if (parsedLimit < 1) {
      errors.push({
        field: 'limit',
        message: 'Limit must be at least 1'
      });
    }

    if (parsedLimit > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit cannot exceed 100'
      });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }

    return {
      valid: true,
      page: parsedPage,
      limit: parsedLimit
    };
  }

  /**
   * Validate sort parameter
   */
  static validateSort(sort, allowedFields = []) {
    if (!sort) {
      return { valid: true, sort: null };
    }

    const sortRegex = /^(-)?([a-zA-Z_]+)$/;
    const match = sort.match(sortRegex);

    if (!match) {
      return {
        valid: false,
        error: 'Invalid sort format. Use: field or -field'
      };
    }

    const direction = match[1] === '-' ? 'desc' : 'asc';
    const field = match[2];

    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      return {
        valid: false,
        error: `Sort field must be one of: ${allowedFields.join(', ')}`
      };
    }

    return {
      valid: true,
      sort: { field, direction }
    };
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate, endDate) {
    const errors = [];

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        errors.push({
          field: 'startDate',
          message: 'Invalid start date format'
        });
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        errors.push({
          field: 'endDate',
          message: 'Invalid end date format'
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        errors.push({
          field: 'dateRange',
          message: 'Start date must be before end date'
        });
      }

      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        errors.push({
          field: 'dateRange',
          message: 'Date range cannot exceed 365 days'
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };
  }

  /**
   * Validate hashtag
   */
  static validateHashtag(hashtag) {
    if (!hashtag || typeof hashtag !== 'string') {
      return {
        valid: false,
        error: 'Hashtag is required'
      };
    }

    const cleanHashtag = hashtag.replace('#', '').trim();

    if (cleanHashtag.length === 0) {
      return {
        valid: false,
        error: 'Hashtag cannot be empty'
      };
    }

    if (cleanHashtag.length > 100) {
      return {
        valid: false,
        error: 'Hashtag is too long (max 100 characters)'
      };
    }

    // Hashtags: alphanumeric and underscores
    const hashtagRegex = /^[a-zA-Z0-9_]+$/;
    if (!hashtagRegex.test(cleanHashtag)) {
      return {
        valid: false,
        error: 'Hashtag can only contain letters, numbers, and underscores'
      };
    }

    return {
      valid: true,
      hashtag: cleanHashtag
    };
  }

  /**
   * Validate video ID
   */
  static validateVideoId(videoId) {
    if (!videoId || typeof videoId !== 'string') {
      return {
        valid: false,
        error: 'Video ID is required'
      };
    }

    // TikTok video IDs are typically numeric strings 19 characters long
    const videoIdRegex = /^\d{19}$/;
    if (!videoIdRegex.test(videoId)) {
      return {
        valid: false,
        error: 'Invalid video ID format'
      };
    }

    return {
      valid: true,
      videoId
    };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str, maxLength = 255) {
    if (!str || typeof str !== 'string') {
      return '';
    }

    return str
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential XSS characters
  }

  /**
   * Validate boolean parameter
   */
  static validateBoolean(value, defaultValue = false) {
    if (value === undefined || value === null) {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return true;
      }
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return false;
      }
    }

    return defaultValue;
  }

  /**
   * Validate array of strings
   */
  static validateStringArray(value, maxLength = 10) {
    if (!value) {
      return { valid: true, array: [] };
    }

    let array;

    if (typeof value === 'string') {
      array = value.split(',').map(item => item.trim()).filter(Boolean);
    } else if (Array.isArray(value)) {
      array = value.filter(item => typeof item === 'string' && item.trim());
    } else {
      return {
        valid: false,
        error: 'Value must be a string or array'
      };
    }

    if (array.length > maxLength) {
      return {
        valid: false,
        error: `Array cannot contain more than ${maxLength} items`
      };
    }

    return {
      valid: true,
      array
    };
  }

  /**
   * Validate enum value
   */
  static validateEnum(value, allowedValues, defaultValue = null) {
    if (!value) {
      return {
        valid: true,
        value: defaultValue
      };
    }

    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        error: `Value must be one of: ${allowedValues.join(', ')}`
      };
    }

    return {
      valid: true,
      value
    };
  }
}

=======
class CommonValidator {
  /**
   * Validate pagination parameters
   */
  static validatePagination(page, limit) {
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;

    const errors = [];

    if (parsedPage < 1) {
      errors.push({
        field: 'page',
        message: 'Page must be at least 1'
      });
    }

    if (parsedPage > 1000) {
      errors.push({
        field: 'page',
        message: 'Page cannot exceed 1000'
      });
    }

    if (parsedLimit < 1) {
      errors.push({
        field: 'limit',
        message: 'Limit must be at least 1'
      });
    }

    if (parsedLimit > 100) {
      errors.push({
        field: 'limit',
        message: 'Limit cannot exceed 100'
      });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors
      };
    }

    return {
      valid: true,
      page: parsedPage,
      limit: parsedLimit
    };
  }

  /**
   * Validate sort parameter
   */
  static validateSort(sort, allowedFields = []) {
    if (!sort) {
      return { valid: true, sort: null };
    }

    const sortRegex = /^(-)?([a-zA-Z_]+)$/;
    const match = sort.match(sortRegex);

    if (!match) {
      return {
        valid: false,
        error: 'Invalid sort format. Use: field or -field'
      };
    }

    const direction = match[1] === '-' ? 'desc' : 'asc';
    const field = match[2];

    if (allowedFields.length > 0 && !allowedFields.includes(field)) {
      return {
        valid: false,
        error: `Sort field must be one of: ${allowedFields.join(', ')}`
      };
    }

    return {
      valid: true,
      sort: { field, direction }
    };
  }

  /**
   * Validate date range
   */
  static validateDateRange(startDate, endDate) {
    const errors = [];

    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        errors.push({
          field: 'startDate',
          message: 'Invalid start date format'
        });
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        errors.push({
          field: 'endDate',
          message: 'Invalid end date format'
        });
      }
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        errors.push({
          field: 'dateRange',
          message: 'Start date must be before end date'
        });
      }

      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        errors.push({
          field: 'dateRange',
          message: 'Date range cannot exceed 365 days'
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return {
      valid: true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    };
  }

  /**
   * Validate hashtag
   */
  static validateHashtag(hashtag) {
    if (!hashtag || typeof hashtag !== 'string') {
      return {
        valid: false,
        error: 'Hashtag is required'
      };
    }

    const cleanHashtag = hashtag.replace('#', '').trim();

    if (cleanHashtag.length === 0) {
      return {
        valid: false,
        error: 'Hashtag cannot be empty'
      };
    }

    if (cleanHashtag.length > 100) {
      return {
        valid: false,
        error: 'Hashtag is too long (max 100 characters)'
      };
    }

    // Hashtags: alphanumeric and underscores
    const hashtagRegex = /^[a-zA-Z0-9_]+$/;
    if (!hashtagRegex.test(cleanHashtag)) {
      return {
        valid: false,
        error: 'Hashtag can only contain letters, numbers, and underscores'
      };
    }

    return {
      valid: true,
      hashtag: cleanHashtag
    };
  }

  /**
   * Validate video ID
   */
  static validateVideoId(videoId) {
    if (!videoId || typeof videoId !== 'string') {
      return {
        valid: false,
        error: 'Video ID is required'
      };
    }

    // TikTok video IDs are typically numeric strings 19 characters long
    const videoIdRegex = /^\d{19}$/;
    if (!videoIdRegex.test(videoId)) {
      return {
        valid: false,
        error: 'Invalid video ID format'
      };
    }

    return {
      valid: true,
      videoId
    };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(str, maxLength = 255) {
    if (!str || typeof str !== 'string') {
      return '';
    }

    return str
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential XSS characters
  }

  /**
   * Validate boolean parameter
   */
  static validateBoolean(value, defaultValue = false) {
    if (value === undefined || value === null) {
      return defaultValue;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
        return true;
      }
      if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
        return false;
      }
    }

    return defaultValue;
  }

  /**
   * Validate array of strings
   */
  static validateStringArray(value, maxLength = 10) {
    if (!value) {
      return { valid: true, array: [] };
    }

    let array;

    if (typeof value === 'string') {
      array = value.split(',').map(item => item.trim()).filter(Boolean);
    } else if (Array.isArray(value)) {
      array = value.filter(item => typeof item === 'string' && item.trim());
    } else {
      return {
        valid: false,
        error: 'Value must be a string or array'
      };
    }

    if (array.length > maxLength) {
      return {
        valid: false,
        error: `Array cannot contain more than ${maxLength} items`
      };
    }

    return {
      valid: true,
      array
    };
  }

  /**
   * Validate enum value
   */
  static validateEnum(value, allowedValues, defaultValue = null) {
    if (!value) {
      return {
        valid: true,
        value: defaultValue
      };
    }

    if (!allowedValues.includes(value)) {
      return {
        valid: false,
        error: `Value must be one of: ${allowedValues.join(', ')}`
      };
    }

    return {
      valid: true,
      value
    };
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = CommonValidator;