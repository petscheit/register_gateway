// import "@t3rn/types/api-augment"

import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
// import { types } from "@t3rn/types/flat";
import { register } from "./register";
import { submitTransfer } from "./submit";
// import { JustificationNotification } from "@polkadot/types"
import { DetectCodec } from "@polkadot/types/types";

import { SubstrateListener } from './listener';


class TransferSiseEffect {
    listener: SubstrateListener
    rococo: ApiPromise;
    circuit: ApiPromise;
    target: number[];

    async setup() {
        this.rococo = await ApiPromise.create({ 
            provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
        })
        this.circuit = await ApiPromise.create({
            provider: new WsProvider("ws://127.0.0.1:9944"),
        })

        this.target = [97, 98, 99, 100]
        this.listener = new SubstrateListener(this.target)
    }

    async run() {
        // .map(() => Math.floor(97 + Math.random() * 26));
        console.log("Initialized API")
        await register(this.circuit, this.target)
        console.log("Registered Roccoco")
        await this.delay()
        await this.listener.initListener()
        // await submitTransfer(this.api, this.target)
        // console.log("Submitted Transfer")
        // this.api.disconnect()
    }

    async initEventListener() : Promise<void> {
        const api = await ApiPromise.create({
            provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
        })

        const circuit = await ApiPromise.create({
            provider: new WsProvider("ws://127.0.0.1:9944"),
        })

        const subJust = await api.rpc.grandpa.subscribeJustifications(async res => {
            console.log("Justification received")
            let tx = await circuit.tx.multiFinalityVerifierPolkadotLike.submitFinalityProof(res.toHuman())

            const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
            const alice = keyring.addFromUri('//Alice');
            circuit.tx.sudo.sudoUncheckedWeight(tx, 1).signAndSend(alice)
            .then(res => console.log("res:", res.toHuman()))
            
            subJust()
        });
    }

    async delay() {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res()
            }, 5000)
        })
    }

}


(async () => {
    let trans = new TransferSiseEffect();
    await trans.setup();
    trans.run()
})()

