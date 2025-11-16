import bcrypt from "bcryptjs";

// salt + hash password
export function saltAndHashPassword(password: string): string {
  const saltRound = 10;
  const salt = bcrypt.genSaltSync(saltRound);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export function comparePassword(
  password: string,
  hashedPassword: string
): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}
