import { ApiPromise, Keyring } from '@polkadot/api';
import { createGatewayABIConfig, createGatewayGenesisConfig, createGatewaySysProps } from './utils/utils';

export const register = async (circuit: ApiPromise, rococo: ApiPromise, target: any[]) => {
  const rococoUrl = 'wss://rococo-rpc.polkadot.io';
  const [rococoCurrentHeader, rococoMetadata, rococoGenesisHash] = await Promise.all([
    await rococo.rpc.chain.getHeader(),
    await rococo.runtimeMetadata,
    await rococo.genesisHash,
  ]);

  const rococoAtGenesis = await rococo.at(rococoGenesisHash);
  const rococoInitialAuthorityList = await rococoAtGenesis.query.session.validators();
  await rococo.disconnect();


  const registerGateway = circuit.tx.circuitPortal.registerGateway(
    rococoUrl,
    String.fromCharCode(...target),
    createGatewayABIConfig(circuit, 32, 32, 32, 12, 'Sr25519', 'Blake2'),
    //GatewayVendor: 'Substrate' as rococo is substrate-based
    circuit.createType('GatewayVendor', 'Substrate'),
    //GatewayType: we connect as a ProgrammableExternal
    circuit.createType('GatewayType', { ProgrammableExternal: 1 }),
    createGatewayGenesisConfig(rococoMetadata, rococoGenesisHash, circuit),
    createGatewaySysProps(circuit, 60, '', 0), // GatewaySysProps
    //Initial rococo, acts as gateway activation point
    circuit.createType('Bytes', rococoCurrentHeader.toHex()),
    //List of current rococo authorities
    circuit.createType('Option<Vec<AccountId>>', rococoInitialAuthorityList),
    //SideEffects that are allowed on gateway instance
    circuit.createType('Vec<AllowedSideEffect>', ['tran']) // allowed side effects
  );

  const keyring = new Keyring({ type: 'sr25519', ss58Format: 60 });
  const alice = keyring.addFromUri('//Alice');
  return circuit.tx.sudo.sudo(registerGateway).signAndSend(alice);
};