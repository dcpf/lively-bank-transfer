export interface IBankApiResponse {
  state: 'success' | 'failed' | 'apiError';
  statusMessage?: string;
}

/**
 * This obviously needs to be implemented. Added some logic to mimic different states.
 */
export class BankApi {

  static sendMoney(transferId: number, fromAccountId: number, toAccountId: number, amount: number): IBankApiResponse {

    console.log(`Submitting transfer ${transferId}. fromAcct: ${fromAccountId}, toAcct: ${toAccountId}, amt: $${amount}.`);

    const rand = Math.floor(Math.random() * 3);

    try {
      // This is where the call to the bank would be performed
      if (rand === 0) {
        throw new Error('Kaboom!');
      }
    } catch (err) {
      console.error(`Error submitting transfer ${transferId}`, err);
      return { state: 'apiError', statusMessage: err.message };
    }

    const state = (rand === 1) ? 'success' : 'failed';
    console.log(`Submitted transfer ${transferId}. fromAcct: ${fromAccountId}, toAcct: ${toAccountId}, amt: $${amount}, status: ${state}.`);
    return { state };

  }
}
