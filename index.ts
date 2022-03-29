import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import types from "./types.json";
import { register } from "./register";
import { submitTransfer } from "./submit";


class TransferSiseEffect {
    api: ApiPromise;

    async run() {
        this.api = await ApiPromise.create({ 
            provider: new WsProvider("ws://127.0.0.1:9944"),
            types: types as any,
        })

        const target = [97, 98, 99, 100]
        // .map(() => Math.floor(97 + Math.random() * 26));
        console.log("Initialized API")
        await register(this.api, target)
        console.log("Registered Roccoco")
        await this.delay()
        await submitTransfer(this.api, target)
        console.log("Submitted Transfer")
        this.api.disconnect()
    }

    async delay() {
        return new Promise<void>((res, rej) => {
            setTimeout(() => {
                res()
            }, 5000)
        })
    }

}


let trans = new TransferSiseEffect().run();