import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockTokenService = {
  issueTokens: jest.fn(),
};

jest.unstable_mockModule("../../repositories/user.repository.js", () => ({
  UserRepository: mockUserRepository,
}));
jest.unstable_mockModule("../token.service.js", () => ({
  TokenService: mockTokenService,
}));

const mockLogger = { warn: jest.fn() };
jest.unstable_mockModule("../../lib/logger.js", () => ({
  logger: mockLogger,
}));

const {
  AuthService,
  EmailAlreadyRegisteredError,
  WeakPasswordError,
  InvalidCredentialsError,
  ValidationError,
} = await import("../auth.service.js");

// A full database row, as Prisma returns it: everything the client must
// never see is present here so the tests can prove it is stripped.
function fullUserRow(overrides = {}) {
  return {
    id: "u1",
    email: "a@x.com",
    displayName: "Alice",
    passwordHash: "$2b$04$not-a-real-hash",
    isVerified: false,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTokenService.issueTokens.mockReturnValue({
    accessToken: "fake-access",
    refreshToken: "fake-refresh",
  });
});

describe("AuthService.register", () => {
  test("creates a user and issues tokens for valid input (row 1)", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue({ id: "u1", email: "a@x.com" });

    const result = await AuthService.register({
      email: "a@x.com",
      displayName: "Alice",
      password: "correcthorse",
    });

    expect(result.user.id).toBe("u1");
    expect(result.accessToken).toBe("fake-access");
  });

  test("rejects an already-registered email (row 2)", async () => {
    mockUserRepository.findByEmail.mockResolvedValue({ id: "existing" });

    await expect(
      AuthService.register({ email: "a@x.com", displayName: "Alice", password: "correcthorse" })
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });

  test("rejects a 7-character password (row 3, boundary)", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      AuthService.register({ email: "a@x.com", displayName: "Alice", password: "1234567" })
    ).rejects.toBeInstanceOf(WeakPasswordError);
  });

  test("accepts an 8-character password (row 4, boundary)", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue({ id: "u1" });

    await expect(
      AuthService.register({ email: "a@x.com", displayName: "Alice", password: "12345678" })
    ).resolves.toBeDefined();
  });

  test("rejects a missing email (row 5, white-box branch)", async () => {
    await expect(
      AuthService.register({ email: "", displayName: "Alice", password: "correcthorse" })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  test("converts a repository failure into EmailAlreadyRegisteredError (row 6, white-box branch)", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockRejectedValue(new Error("unique constraint violated"));

    await expect(
      AuthService.register({ email: "a@x.com", displayName: "Alice", password: "correcthorse" })
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);
  });
});

describe("AuthService.register response shape", () => {
  test("returns only the public projection of the created user, never the row", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(fullUserRow());

    const result = await AuthService.register({
      email: "a@x.com",
      displayName: "Alice",
      password: "correcthorse",
    });

    expect(result.user).toEqual({ id: "u1", displayName: "Alice" });
  });
});

describe("AuthService.login", () => {
  test("rejects an unknown email with InvalidCredentialsError and logs it", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      AuthService.login({ email: "nobody@x.com", password: "correcthorse" })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ event: "auth.login.failed", reason: "no_such_user" }),
      expect.any(String)
    );
  });

  test("rejects a wrong password with InvalidCredentialsError and logs it", async () => {
    const passwordHash = await bcrypt.hash("correcthorse", 4);
    mockUserRepository.findByEmail.mockResolvedValue(fullUserRow({ passwordHash }));

    await expect(
      AuthService.login({ email: "a@x.com", password: "wrong-password" })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ event: "auth.login.failed", reason: "bad_password" }),
      expect.any(String)
    );
  });

  test("returns only the public projection of the user on success", async () => {
    const passwordHash = await bcrypt.hash("correcthorse", 4);
    mockUserRepository.findByEmail.mockResolvedValue(fullUserRow({ passwordHash }));

    const result = await AuthService.login({ email: "a@x.com", password: "correcthorse" });

    expect(result.user).toEqual({ id: "u1", displayName: "Alice" });
    expect(result.accessToken).toBe("fake-access");
  });
});
