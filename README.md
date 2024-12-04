### My Notes:

* Are the accounts attached to the Transfer object supposed to be the latest? I would lean towards looking them up when needed, and only have "from" and "to" acct IDs in the Transfer object.
* Assuming there will be some other process that submits transfers in "pending" state (I.e., when processImmediately !== true). Not implemented for this exercise.
* Transfer records in "apiError" state can be retried at a later date/time. Not implemented for this exercise.
* Obviously needs unit/integration tests to verify everything is working as intended.

### Original README:

Steps to run:
- run `yarn install`
- run `yarn start` to execute code in src/index.ts


Feel free to modify any existing code as you find useful, including existing entity definitions.

For simplicity, account balances and transfer amounts are assumed to be integers.

Only try to complete as many steps as you can.

Once complete, do not make a pull request to the repo. Share access to the organizers provided to you.

useful docs: https://typeorm.io/

this test uses the datamapper pattern: https://typeorm.io/active-record-data-mapper

it also uses a sqlite database with `synchronize` set to true: https://typeorm.io/data-source-options#sqlite-data-source-options

(migrations aren't required)


1. Implement TransferManager.createTransfer. It should take a fromAccount, a toAccount, an amount, and optionally,
   a processImmediately flag. If processImmediately is true, BankApi.sendMoney should be called on transfer creation.
   Keep track of transfer state so that deferred transfers can be processed later. 
   
   Trying to process transfers that have already called BankApi.sendMoney should throw an error.
   Trying to send more money out of an account than the account has should throw an error.
   How and when to change account balances for pending transfers is left as a design decision.

2. Implement AccountManager.reconcileBalances. Check that an account's current balance is as expected given the initial balance
   it was created with (passed in during AccountManager.createAccount) and all transfers in and out. Output an error message 
   if the balance is incorrect, along with the expected and actual amounts. 
 
3. Account for the possibility that a bank-api call fails. Handle error and state management in a way that makes sense 
   to you. Consider the difference between short term and long term outages.
