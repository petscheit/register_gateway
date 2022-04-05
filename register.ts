import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { createGatewayABIConfig, createGatewayGenesisConfig, createGatewaySysProps } from './utils/utils';
import '@t3rn/types';
import {T3rnPrimitivesAbiGatewayABIConfig} from "@polkadot/types/lookup";

export const register = async (circuitApi: ApiPromise, target: any[]) => {
    const rococoUrl = 'wss://rococo-rpc.polkadot.io'; // ws endpoint of target chain
    const rococoProvider = new WsProvider(rococoUrl);
    const rococoApi = await ApiPromise.create({ provider: rococoProvider });
    
    const [rococoCurrentHeader, rococoMetadata, rococoGenesisHash] = await Promise.all([
      await rococoApi.rpc.chain.getHeader(),
      await rococoApi.runtimeMetadata,
      await rococoApi.genesisHash,
    ]);
    
    const rococoAtGenesis = await rococoApi.at(rococoGenesisHash);
    const rococoInitialAuthorityList = await rococoAtGenesis.query.session.validators();
    await rococoApi.disconnect();
    

    const registerGateway = circuitApi.tx.circuitPortal.registerGateway(
      rococoUrl,
      String.fromCharCode(...target),
      {
          hashSize: 32,
          addressLength: 32,
          blockNumberTypeSize: 32,
          decimals: 12,
          crypto: 'Sr25519',
          hasher: "Blake2",
          structs: []
      },
      //GatewayVendor: 'Substrate' as rococo is substrate-based
      'Substrate',
      //GatewayType: we connect as a ProgrammableExternal
      "ProgrammableExternal",
      createGatewayGenesisConfig(rococoMetadata, rococoGenesisHash, circuitApi),
      createGatewaySysProps(circuitApi, 60, '', 0), // GatewaySysProps
      //Initial rococo, acts as gateway activation point
      rococoCurrentHeader.toHex(),
      //List of current rococo authorities
      rococoInitialAuthorityList,
      //SideEffects that are allowed on gateway instance
      circuitApi.createType('Vec<[u8;4]>', ['tran']) // allowed side effects
    );
    
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
    const alice = keyring.addFromUri('//Alice');
    return circuitApi.tx.sudo.sudo(registerGateway).signAndSend(alice);
};
