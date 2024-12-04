import "reflect-metadata";
import { AccountManager } from "./models/account/manager";
import { TransferManager } from "./models/transfer/manager";
import { createConnection } from "./lib/datasource";

createConnection().then(async connection => {
  const account1 = await AccountManager.createAccount(50);
  const account2 = await AccountManager.createAccount(50);
  await TransferManager.createTransfer({ fromAccount: account1, toAccount: account2, amount: 10, processImmediately: true });
  await TransferManager.createTransfer({ fromAccount: account1, toAccount: account2, amount: 25, processImmediately: true });
  await TransferManager.createTransfer({ fromAccount: account1, toAccount: account2, amount: 15 });
  await TransferManager.createTransfer({ fromAccount: account1, toAccount: account2, amount: 1, processImmediately: true });
  await TransferManager.createTransfer({ fromAccount: account2, toAccount: account1, amount: 5, processImmediately: true });
  await AccountManager.reconcileBalances(account1.id);
  await AccountManager.reconcileBalances(account2.id);
}).catch(error => console.log(error));
