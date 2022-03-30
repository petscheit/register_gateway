import { ApiPromise, WsProvider } from '@polkadot/api';
import { JustificationNotification } from '@polkadot/types/interfaces/';
import { submitProof } from "./relayer"
require('dotenv').config();

export class SubstrateListener {
    rangeSize: number;
    gatewayId: any[];
    headers: any[] = [];
    headerListener: any;
    anchorJustification: JustificationNotification;
    circuit: ApiPromise;
    rococo: ApiPromise;

    constructor(circuit: ApiPromise, rococo: ApiPromise, gatewayId: any[]) {
        this.rangeSize = Number(process.env.RANGE_SIZE);
        this.gatewayId = gatewayId;
        this.circuit = circuit;
        this.rococo = rococo;
    }

    async initListener() {
        let listener = await ApiPromise.create({
            provider: new WsProvider("wss://rococo-rpc.polkadot.io"),
        })
        // this.circuit = a
        this.headerListener = await listener.rpc.chain.subscribeNewHeads(async (header) => {
            console.log("Header:", header.number.toNumber());
            this.headers.push(header)

            if (this.headers.length === this.rangeSize) {
                console.log("range size reached! continuing listen until matchig justification is found")
                this.fetchIncomingGrandpaJustification(listener);
            }
        });
    }

    async fetchIncomingGrandpaJustification(api: ApiPromise) {
        console.log("Started Grandpa Justification Listener...")
        let listener = await api.rpc.grandpa.subscribeJustifications((justification: JustificationNotification) => {
            console.log("Caught Justification!")
            // this.anchorJustification = justification;

            this.conclude(justification)
            listener();
        })
    }

    async conclude(justification: JustificationNotification) {
        this.headerListener() // terminate header listener
        console.log("Headers found:", this.headers.length);

        submitProof(this.circuit, justification, this.headers, this.gatewayId);
    }

}

// let instance = new SubstrateListener();

// process.on("message", (msg: string) => {
//     if (msg === "init") {
//         instance.initListener()
//     }
// })

