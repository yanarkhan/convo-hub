import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;
const INBOX_ID = process.env.MAILTRAP_INBOX_ID;
const ACCOUNT_ID = process.env.MAILTRAP_ACCOUNT_ID;

if (!TOKEN || !INBOX_ID || !ACCOUNT_ID) {
  throw new Error(
    "MAILTRAP_TOKEN, MAILTRAP_INBOX_ID and MAILTRAP_ACCOUNT_ID must be defined in .env"
  );
}

const mailtrap = new MailtrapClient({
  token: TOKEN,
  testInboxId: Number.parseInt(INBOX_ID),
  accountId: Number.parseInt(ACCOUNT_ID),
});

export default mailtrap;
