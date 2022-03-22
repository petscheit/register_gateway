import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';


import { createGatewayABIConfig, createGatewayGenesisConfig, createGatewaySysProps } from './utils/utils';
import types from "./types.json"
(async () => {
  const circuitProvider = new WsProvider('ws://127.0.0.1:9944'); // t3rn circuit ws endpoint
  const circuitApi: ApiPromise = await ApiPromise.create({
    provider: circuitProvider,
    types: types as any
  });

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

  const gatewayId = String.fromCharCode(...[0, 0, 0, 0].map(() => Math.floor(97 + Math.random() * 26)));

  const registerGateway = circuitApi.tx.circuitPortal.registerGateway(
    rococoUrl,
    gatewayId,
    createGatewayABIConfig(circuitApi, 32, 32, 32, 12, 'Sr25519', 'Blake2'),
    //GatewayVendor: 'Substrate' as rococo is substrate-based
    circuitApi.createType('GatewayVendor', 'Substrate'),
    //GatewayType: we connect as a ProgrammableExternal
    circuitApi.createType('GatewayType', { ProgrammableExternal: 1 }),
    createGatewayGenesisConfig(rococoMetadata, rococoGenesisHash, circuitApi),
    createGatewaySysProps(circuitApi, 60, '', 0), // GatewaySysProps
    //Initial rococo, acts as gateway activation point
    circuitApi.createType('Bytes', rococoCurrentHeader.toHex()),
    //List of current rococo authorities
    circuitApi.createType('Option<Vec<AccountId>>', rococoInitialAuthorityList),
    //SideEffects that are allowed on gateway instance
    circuitApi.createType('Vec<AllowedSideEffect>', ['tran']) // allowed side effects
  );

  const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
  const alice = keyring.addFromUri('//Alice');
  await circuitApi.tx.sudo.sudo(registerGateway).signAndSend(alice);

  circuitApi.disconnect();
})();
