export interface User {
  id: string;
  name: string;
  age?: number;
  gender?: "male" | "female" | "other";
  heightCm?: number;
  weightKg?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very-active";
  goals?: string[];
  createdAt?: string; // ISO date
}

export type PartialUser = Partial<User> & { id?: string };

export default User;
