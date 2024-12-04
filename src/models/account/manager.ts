import { UpdateResult } from "typeorm";
import { Account } from "./entity";
import { AppDataSource } from "../../lib/datasource";

export class AccountManager {
  static get repository() {
    return AppDataSource.getRepository(Account);
  }

  static async createAccount(balance: number): Promise<Account> {
    return this.repository.save({ initialBalance: balance, balance });
  }

  static async lookupAccount(id: number): Promise<Account> {
    return await this.repository.findOne({ where: { id } });
  }

  static async updateBalance(id: number, amount: number, action: 'add' | 'subtract'): Promise<UpdateResult> {
    const acct = await this.lookupAccount(id);
    const balance = action === 'add' ? acct.balance + amount : acct.balance - amount;
    if (balance < 0) {
      // Should we abort here, or is it ok for balance to be in the negative?
      console.warn(`Acct ${id} balance is < 0`);
    }
    console.log(`Updating balance for acct ${id} from ${acct.balance} to ${balance}`);
    const updateResult = await this.repository.update({ id }, { balance });
    if (updateResult.affected === 0) {
      console.error(`Error updating balance for account ${id}`);
    }
    return updateResult;
  }

  static async reconcileBalances(id: string) {
  }

}
