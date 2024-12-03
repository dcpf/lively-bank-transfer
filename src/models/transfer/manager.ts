import { AppDataSource } from "../../lib/datasource";
import type { Account } from "../account/entity";
import { Transfer } from "./entity";

interface ICreateTransferOptions {
  fromAccount: Account;
  toAccount: Account;
  amount: number;
  processImmediately?: boolean;
}

export class TransferManager {
  static get repository() {
    return AppDataSource.getRepository(Transfer);
  }

  static async createTransfer({ fromAccount, toAccount, amount, processImmediately }: ICreateTransferOptions): Promise<Transfer> {
    return this.repository.save({
      fromAccount,
      toAccount,
      amount
    });
    return {} as any
  }

}
