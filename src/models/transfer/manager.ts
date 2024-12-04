import { In } from "typeorm";
import { BankApi, IBankApiResponse } from "../../lib/bank-api";
import { AppDataSource } from "../../lib/datasource";
import type { Account } from "../account/entity";
import { AccountManager } from "../account/manager";
import { Transfer } from "./entity";

const MAX_RETRIES = 3;

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

  static async lookupTransfer(id: number): Promise<Transfer> {
    return await this.repository.findOne({
      where: { id },
      relations: {
        fromAccount: true,
        toAccount: true,
      }
    });
  }

  /**
   * Lookup all transfers for an account that are either pending or submitted
   *
   * @param accountId 
   * @returns Transfer[]
   */
  static async lookupPendingTransfers(accountId: number): Promise<Transfer[]> {
    return await this.repository.find({
      where: { fromAccount: { id: accountId }, state: In(['pending', 'submitted']) },
      relations: {
        fromAccount: true,
        toAccount: true,
      }
    });
  }

  /**
   * Get an account's available funds using the balance and any pending transfers
   * 
   * @param acctId
   * @param excludedTransferIds - transfer IDs to exclude 
   * @returns number
   */
  static async getAvailableFunds(acctId: number, excludedTransferIds?: number[]): Promise<number> {
    const fromAcct = await AccountManager.lookupAccount(acctId);
    const pendingTransfers = await this.lookupPendingTransfers(acctId);
    const pendingTransferAmount = pendingTransfers.reduce<number>((acc, xfer) => {
      return excludedTransferIds?.includes(xfer.id) ? acc : acc + xfer.amount;
    },
      0);
    return fromAcct.balance - pendingTransferAmount;
  }

  static validateStateForProcessing(transfer: Transfer) {
    const { id, state } = transfer;
    if (state !== 'pending') {
      throw new Error(`Transfer ${id} is in invalid state for processing: ${state}`);
    }
  }

  static async createTransfer({ fromAccount, toAccount, amount, processImmediately }: ICreateTransferOptions): Promise<Transfer> {

    const availableFunds = await this.getAvailableFunds(fromAccount.id);
    if (amount > availableFunds) {
      throw new Error(`Create transfer error: Insufficient funds for acct ${fromAccount.id}. Transfer amt: $${amount}, Available funds: $${availableFunds}`);
    }

    const transfer = await this.repository.save({
      fromAccount,
      toAccount,
      amount,
      state: 'pending',
    });
    console.log(`Created transfer record. id: ${transfer.id}, fromAcct: ${fromAccount.id}, toAcct: ${toAccount.id}, amt: ${amount}`);

    if (processImmediately) {
      return await this.doTransfer(transfer);
    }

    return transfer;
  }

  /**
   * Calls BankApi.sendMoney(), and updates Transfer and Account objects accordingly.
   * DB update errors are only logged for now. Ideally, there may be some form of
   * rollback mechanism, or maybe some async process that tries to correct the data.
   * 
   * @param Transfer object
   * @returns Transfer object
   */
  static async doTransfer(transfer: Transfer): Promise<Transfer> {

    const { id, fromAccount, toAccount, amount } = transfer;

    this.validateStateForProcessing(transfer);

    const availableFunds = await this.getAvailableFunds(fromAccount.id, [id]);
    if (amount > availableFunds) {
      await this.repository.update(
        { id },
        {
          state: 'cancelled',
          statusMessage: 'Insufficient funds',
        },
      );
      throw new Error(`Submit transfer error: Insufficient funds for acct ${fromAccount.id}. Transfer amt: $${amount}, Available funds: $${availableFunds}`);
    }

    let updateResult = await this.repository.update(
      { id },
      { state: 'submitted' },
    );

    if (updateResult.affected === 0) {
      console.error(`Error setting transfer ${id} state to 'submitted'`);
    }

    // Very basic impl for retries
    let response: IBankApiResponse;
    for (let i = 0; i < MAX_RETRIES; i++) {
      response = BankApi.sendMoney(id, fromAccount.id, toAccount.id, amount);
      if (response.state !== 'apiError') {
        break;
      }
    }

    updateResult = await this.repository.update(
      { id },
      {
        state: response.state,
        statusMessage: response.statusMessage,
      },
    );

    if (updateResult.affected === 0) {
      console.error(`Error setting transfer ${id} state to '${response.state}'`);
    }

    if (response.state === 'success') {
      await AccountManager.updateBalance(fromAccount.id, amount, 'subtract');
      await AccountManager.updateBalance(toAccount.id, amount, 'add');
    }

    return await this.lookupTransfer(id);
  }

}
