const COMMON_PASSWORDS = new Set([
  "password123",
  "password123!",
  "qwerty123456",
  "123456789012",
  "photofly123!",
]);

export function passwordValidationError(password: string, email = "") {
  if (password.length < 12) return "Password must be at least 12 characters";
  if (password.length > 128) return "Password must be no more than 128 characters";
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return "Password must include uppercase and lowercase letters";
  }
  if (!/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return "Password must include a number and a special character";
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) return "Choose a less common password";
  const localPart = email.split("@")[0]?.toLowerCase();
  if (localPart && localPart.length >= 3 && password.toLowerCase().includes(localPart)) {
    return "Password must not contain your email name";
  }
  return null;
}
