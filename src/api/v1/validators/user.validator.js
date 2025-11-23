<<<<<<< HEAD
class UserValidator {
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    const cleanUsername = username.replace('@', '').trim();

    if (cleanUsername.length === 0) {
      return { valid: false, error: 'Username cannot be empty' };
    }

    if (cleanUsername.length > 24) {
      return { valid: false, error: 'Username is too long (max 24 characters)' };
    }

    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return { 
        valid: false, 
        error: 'Username can only contain letters, numbers, dots, and underscores' 
      };
    }

    return { valid: true, username: cleanUsername };
  }

  static validateLimit(limit) {
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedLimit)) {
      return { valid: false, error: 'Limit must be a number' };
    }
    
    if (parsedLimit < 1) {
      return { valid: false, error: 'Limit must be at least 1' };
    }
    
    if (parsedLimit > 100) {
      return { valid: false, error: 'Limit cannot exceed 100' };
    }
    
    return { valid: true, limit: parsedLimit };
  }
}

=======
class UserValidator {
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') {
      return { valid: false, error: 'Username is required' };
    }

    const cleanUsername = username.replace('@', '').trim();

    if (cleanUsername.length === 0) {
      return { valid: false, error: 'Username cannot be empty' };
    }

    if (cleanUsername.length > 24) {
      return { valid: false, error: 'Username is too long (max 24 characters)' };
    }

    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      return { 
        valid: false, 
        error: 'Username can only contain letters, numbers, dots, and underscores' 
      };
    }

    return { valid: true, username: cleanUsername };
  }

  static validateLimit(limit) {
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedLimit)) {
      return { valid: false, error: 'Limit must be a number' };
    }
    
    if (parsedLimit < 1) {
      return { valid: false, error: 'Limit must be at least 1' };
    }
    
    if (parsedLimit > 100) {
      return { valid: false, error: 'Limit cannot exceed 100' };
    }
    
    return { valid: true, limit: parsedLimit };
  }
}

>>>>>>> e27533f87368340f23e3089368ca2dd2d612f331
module.exports = UserValidator;