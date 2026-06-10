import { usersRepository } from '../repositories/usersRepository';
import { newUser, updateUser } from '../models/usersModel';

export const usersService = {
  findUserByGoogleId(googleId: string) {
    return usersRepository.findUserByGoogleId(googleId);
  },
  findUserById(id: string) {
    return usersRepository.findUserById(id);
  },
  createUser(newUser: newUser) {
    return usersRepository.createUser(newUser);
  },
  async updateUser(id: string, displayName: string | undefined, avatarUrl: string | undefined) {
    if (displayName === undefined && avatarUrl === undefined) {
      throw new Error("At least one of displayName or avatarUrl must be provided for update.");
    }

    const user = await usersRepository.findUserById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Partial<updateUser> = {
      displayName,
      avatarUrl,
      updatedAt: new Date(),
    };
    
    return usersRepository.updateUser(user.id, updates);
  },
};