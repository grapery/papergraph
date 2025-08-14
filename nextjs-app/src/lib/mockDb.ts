// Mock user database for development
// In production, this would be replaced with a real database
export class MockUserDatabase {
  private static instance: MockUserDatabase;
  private users: Map<string, any> = new Map();
  private resetTokens: Map<string, string> = new Map();

  static getInstance(): MockUserDatabase {
    if (!MockUserDatabase.instance) {
      MockUserDatabase.instance = new MockUserDatabase();
    }
    return MockUserDatabase.instance;
  }

  // User operations
  createUser(userData: any) {
    const user = {
      id: Date.now(),
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stats: {
        analyses: 0,
        followers: 0,
        following: 0,
        likes: 0,
        citations: 0,
        badges: 0,
      }
    };
    
    this.users.set(userData.email, user);
    return user;
  }

  getUserByProvider(provider: string, providerId: string) {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.provider === provider && user.providerId === providerId) {
        return user;
      }
    }
    return null;
  }

  getUserByEmail(email: string) {
    return this.users.get(email);
  }

  getUserById(id: number) {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  updateUser(email: string, updates: any) {
    const user = this.users.get(email);
    if (user) {
      this.users.set(email, {
        ...user,
        ...updates,
        updated_at: new Date().toISOString(),
      });
      return this.users.get(email);
    }
    return null;
  }

  // Password reset operations
  createResetToken(email: string, token: string) {
    this.resetTokens.set(token, email);
  }

  getEmailByResetToken(token: string) {
    return this.resetTokens.get(token);
  }

  removeResetToken(token: string) {
    this.resetTokens.delete(token);
  }

  // Utility methods
  emailExists(email: string) {
    return this.users.has(email);
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  clear() {
    this.users.clear();
    this.resetTokens.clear();
  }
}

export const mockUserDb = MockUserDatabase.getInstance();