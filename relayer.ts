import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { JustificationNotification } from '@polkadot/types/interfaces/';

export const submitProof = async (justification: JustificationNotification, headers: any[], gatewayId: any[]) => {
    const circuit = await ApiPromise.create({
        provider: new WsProvider("ws://127.0.0.1:9944")
    });

    let tx = await circuit.tx.multiFinalityVerifierPolkadotLike.submitFinalityProof(
        headers[headers.length - 1],
        justification.toHuman(),
        gatewayId
    )

    const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
    const alice = keyring.addFromUri('//Alice');
    await circuit.tx.sudo.sudoUncheckedWeight(tx, 1).signAndSend(alice)
        .then(res => console.log("res:", res.toHuman()))
}