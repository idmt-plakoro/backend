import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { user, newUser } from "../models/usersModel";

export const usersRepository = {
  async findUserByGoogleId(googleId: string): Promise<user | undefined> {
    const result = await db.select({
      id: users.id,
      googleId: users.googleId,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.googleId, googleId))
    .limit(1);

    const user = result[0];
    if (!user) return undefined;

    return user
  },
  async findUserById(id: string): Promise<user | undefined> {
    const result = await db.select({
      id: users.id,
      googleId: users.googleId,
      email: users.email,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

    const user = result[0];
    if (!user) return undefined;

    return user;
  },
  async createUser(newUser: newUser): Promise<user> {
    const result = await db.insert(users).values(newUser).returning();
    const createdUser = result[0];

    return createdUser;
  }
}