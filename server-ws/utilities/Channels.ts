import { Identifiable } from "../types/User.ts"

export const getChannel = ({ id }: Identifiable) => `user:${id}`