import { usersRepository } from '../repositories/usersRepository';
import { newUser } from '../models/usersModel';

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
};