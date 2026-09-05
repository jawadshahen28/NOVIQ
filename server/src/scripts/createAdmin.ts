import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { AdminModel } from '../models/Admin.js';
import { adminBootstrapSchema } from '../validators/authValidators.js';
import { hashPassword, passwordRequirements } from '../utils/password.js';

function formatIssues(error: { issues: Array<{ path: PropertyKey[]; message: string }> }) {
  return error.issues
    .map((issue) => {
      const path = issue.path.map(String).join('.') || 'input';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

async function createAdmin() {
  const parsedInput = adminBootstrapSchema.safeParse({
    ADMIN_BOOTSTRAP_EMAIL: process.env.ADMIN_BOOTSTRAP_EMAIL,
    ADMIN_BOOTSTRAP_NAME: process.env.ADMIN_BOOTSTRAP_NAME,
    ADMIN_BOOTSTRAP_PASSWORD: process.env.ADMIN_BOOTSTRAP_PASSWORD,
  });

  if (!parsedInput.success) {
    throw new Error(
      `Invalid admin bootstrap configuration: ${formatIssues(parsedInput.error)}. ${passwordRequirements}.`,
    );
  }

  const { ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_NAME, ADMIN_BOOTSTRAP_PASSWORD } =
    parsedInput.data;

  await connectDatabase();

  try {
    const existingAdmin = await AdminModel.exists({ email: ADMIN_BOOTSTRAP_EMAIL });

    if (existingAdmin) {
      throw new Error('An active or inactive Admin already exists with this email');
    }

    const passwordHash = await hashPassword(ADMIN_BOOTSTRAP_PASSWORD);

    await AdminModel.create({
      email: ADMIN_BOOTSTRAP_EMAIL,
      isActive: true,
      name: ADMIN_BOOTSTRAP_NAME,
      passwordHash,
      role: 'admin',
    });

    console.info(`Admin account created for ${ADMIN_BOOTSTRAP_EMAIL}`);
  } finally {
    await disconnectDatabase();
  }
}

createAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[api] Admin bootstrap failed: ${message}`);
  process.exit(1);
});
