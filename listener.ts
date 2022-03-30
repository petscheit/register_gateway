import { ApiPromise, WsProvider } from '@polkadot/api';
import { JustificationNotification } from '@polkadot/types/interfaces/';
import { submitProof } from "./relayer"
require('dotenv').config();

export class SubstrateListener {
    wsProvider: WsProvider
    rangeSize: number;
    gatewayId: any[];
    headers: any[] = [];
    headerListener: any;
    anchorJustification: JustificationNotification;
    apiPromise: ApiPromise;

    constructor(gatewayId: any[]) {
        this.wsProvider = new WsProvider(process.env.TARGET_RPC);
        this.rangeSize = Number(process.env.RANGE_SIZE);
        this.gatewayId = gatewayId;
    }

    async initListener() {
        this.apiPromise = await ApiPromise.create({ provider: this.wsProvider });
        this.headerListener = await this.apiPromise.rpc.chain.subscribeNewHeads(async (header) => {
            console.log("Header:", header.number.toNumber());
            this.headers.push(header)

            if (this.headers.length === this.rangeSize) {
                console.log("range size reached! continuing listen until matchig justification is found")
                this.fetchIncomingGrandpaJustification();
            }
        });
    }

    async fetchIncomingGrandpaJustification() {
        console.log("Started Grandpa Justification Listener...")
        let listener = await this.apiPromise.rpc.grandpa.subscribeJustifications((justification: JustificationNotification) => {
            console.log("Caught Justification!")
            console.log(justification)
            // this.anchorJustification = justification;

            this.conclude(justification)
            listener();
        })
    }

    async conclude(justification: JustificationNotification) {
        this.headerListener() // terminate header listener
        console.log("Headers found:", this.headers.length);

        submitProof(justification, this.headers, this.gatewayId);
    }

}

// let instance = new SubstrateListener();

// process.on("message", (msg: string) => {
//     if (msg === "init") {
//         instance.initListener()
//     }
// })

