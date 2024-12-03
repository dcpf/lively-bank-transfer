import "reflect-metadata";
import { AccountManager } from "./models/account/manager";
import { TransferManager } from "./models/transfer/manager";
import { createConnection } from "./lib/datasource";

createConnection().then(async connection => {
  const account1 = await AccountManager.createAccount(50);
  console.log(account1);
  const account2 = await AccountManager.createAccount(50);
  console.log(account2);
  const transfer = await TransferManager.createTransfer({ fromAccount: account1, toAccount: account2, amount: 10 });
  console.log(transfer)
}).catch(error => console.log(error));
