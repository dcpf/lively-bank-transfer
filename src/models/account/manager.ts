import { Account } from "./entity";
import { AppDataSource } from "../../lib/datasource";


export class AccountManager {
  static get repository()  {
    return AppDataSource.getRepository(Account);
  }

  static async createAccount(balance: number): Promise<Account> {
    return this.repository.save({balance});
  }

  static async reconcileBalances(id: string) {
  }

}
