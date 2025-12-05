import { IndexedEntity } from "./core-utils";
import type { User } from "@shared/types";
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    phone: "",
    email: "",
    name: "",
    role: "challenger",
    captainId: null,
    referralCode: "",
    timezone: "UTC",
    points: 0,
    createdAt: 0,
    isActive: true,
    hasScale: false
  };
}