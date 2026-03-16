import { prisma } from "@/src/db/client";

const DEFAULT_USER_EMAIL = process.env.DEMO_AUTH_EMAIL ?? "demo@local.dev";
const DEFAULT_PORTFOLIO_NAME = "Local Primary Portfolio";
const DEFAULT_ACCOUNT_ALIAS = "LOCAL-DEFAULT";

export type LocalContext = {
  userId: string;
  portfolioId: string;
  accountId: string;
};

export async function ensureLocalContext(): Promise<LocalContext> {
  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: {
      email: DEFAULT_USER_EMAIL,
      displayName: "Local Demo User",
    },
  });

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      userId: user.id,
      name: DEFAULT_PORTFOLIO_NAME,
    },
  });
  const portfolio =
    existingPortfolio ??
    (await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: DEFAULT_PORTFOLIO_NAME,
        baseCurrency: "KRW",
      },
    }));

  const existingAccount = await prisma.brokerAccount.findFirst({
    where: {
      portfolioId: portfolio.id,
      accountAlias: DEFAULT_ACCOUNT_ALIAS,
    },
  });
  const account =
    existingAccount ??
    (await prisma.brokerAccount.create({
      data: {
        portfolioId: portfolio.id,
        brokerName: "LOCAL",
        accountAlias: DEFAULT_ACCOUNT_ALIAS,
        baseCurrency: "USD",
      },
    }));

  return {
    userId: user.id,
    portfolioId: portfolio.id,
    accountId: account.id,
  };
}
