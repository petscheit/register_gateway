import { Bytes, Metadata } from '@polkadot/types';
import { ApiPromise } from '@polkadot/api';
import { Hash } from '@polkadot/types/interfaces';
import { T3rnPrimitivesAbiGatewayABIConfig, T3rnPrimitivesGatewaySysProps } from '@polkadot/types/lookup';

export function createGatewayABIConfig(
  api: ApiPromise,
  hash_size: number,
  address_length: number,
  block_number_type_size: number,
  decimals: number,
  crypto: 'Ed25519' | 'Sr25519' | 'Ecdsa',
  hasher: 'Blake2' | 'Keccak256'
): T3rnPrimitivesAbiGatewayABIConfig {
  return api.createType('GatewayABIConfig', [
    api.createType('u16', block_number_type_size),
    api.createType('u16', hash_size),
    api.createType('HasherAlgo', hasher),
    api.createType('CryptoAlgo', crypto),
    api.createType('u16', address_length),
    api.createType('u16', 32),
    api.createType('u16', decimals),
    api.createType('Vec<StructDecl>', []),
  ]);
}

export function createGatewayGenesisConfig(
  metadata: Metadata,
  genesisHash: Hash,
  circuitApi: ApiPromise
): any {
  return circuitApi.createType('T3rnPrimitivesGatewayGenesisConfig', [
    metadata.asV14.pallets,
    metadata.asV14.extrinsic.version,
    genesisHash,
  ]);
}

export function createGatewaySysProps(
  api: ApiPromise,
  ss58Format: number,
  tokenSymbol: string,
  tokenDecimals: number
): T3rnPrimitivesGatewaySysProps {
  return api.createType('T3rnPrimitivesGatewaySysProps', [
    api.createType('u16', ss58Format),
    api.createType('Bytes', new Bytes(api.registry, tokenSymbol)),
    api.createType('u8', tokenDecimals),
  ]);
}

// export function createSideEffect(
//   api: ApiPromise,
//   target: number[],
//   keyring: any,
// ) {
//   // return api.createType('SideEffect', [
//   //   // api.createType('TargetId', target),
//   //   target,
//   //   0,
//   //   0,
//   //   // api.createType('Bytes', new Bytes(api.registry, [116, 114, 97, 110])),
//   //   [116, 114, 97, 110],
//   //   // api.createType('Vec<Bytes>', [
//   //   //   // new Bytes(api.registry, keyring.alice.address), 
//   //   //   // new Bytes(api.registry, keyring.charlie.address), 
//   //   //   // new Bytes(api.registry, [1, 0, 0, 0, 0, 0, 0, 0]),
      
//   //   // ]),
//   //   [keyring.alice.address, keyring.charlie.address, [1, 0, 0, 0, 0, 0, 0, 0]],
//   //   // api.createType('Bytes', new Bytes(api.registry, [])),
//   //   [],
//   //   // api.createType('Option<AccountId>', false)
//   //   false
//   // ]);
//   return {
//     target: target, // [97, 98, 99, 100] -> registered for testing, "abcd" in bytes
//     prize: 0,
//     ordered_at: 0,
//     encoded_action: [116, 114, 97, 110], //tran
//     encoded_args: [keyring.alice.address, keyring.charlie.address, [1, 0, 0, 0, 0, 0, 0, 0]],
//     signature: [],
//     enforce_executioner: false,
//   }
// }

export function randomGatewayId() {
  return String.fromCharCode(...[0, 0, 0, 0].map(() => Math.floor(97 + Math.random() * 26)));
}
