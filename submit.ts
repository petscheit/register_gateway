import { ApiPromise } from "@polkadot/api/promise";
import { createTestPairs } from "@polkadot/keyring/testingPairs";

export const submitTransfer = async (api: ApiPromise, target: any[]) => {

    const keyring = createTestPairs({ type: 'sr25519' });
    return api.tx.circuit
        .onExtrinsicTrigger(
          [{
              target: 'abcd', // [97, 98, 99, 100] -> registered for testing, "abcd" in bytes
              prize: 0,
              orderedAt: 0,
              encodedAction: 'tran', //tran
              encodedArgs: [keyring.alice.address, keyring.charlie.address, [1, 0, 0, 0, 0, 0, 0, 0]],
              signature: [],
              enforceExecutioner: false,
          }],
    0, // fee must be set to 0
            true
        ).signAndSend(keyring.alice)
        .catch(err => console.error(err));

}