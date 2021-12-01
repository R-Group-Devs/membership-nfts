# Membership NFTs

Ownable, burnable, mintable, non-transferable NFTs fit for use as reputation-based voting power

## Possible future features

- [x] Allow owner to activate + deactivate transferability
- [x] Add permanent "mintedFor" address to token metadata, so potentially could allow transferability but only grant voting power when the mintedFor address is the owner

## Plan

Testnet phase

- [x] Deploy to testnet
- [x] Try verifying testnet on etherscan
- [x] Try interacting with the contract via etherscan

Polygon initial

- [x] Deploy to polygon with R Group multisig as owner
- [x] Verify on etherscan equivalent
- [x] Use multisig to mint NFTs for R Group members
- [x] Swap snapshot strategy to membership NFTs

Factory + frontend

- [ ] Frontend deploys a new memberships contract (polygon only)
- [ ] Frontend displays memberships

Mainnet

- [ ] Deploy on mainnet with Rarible DAO multisig as owner
- [ ] Verify on etherscan
- [ ] Use multisig to mint NFTs to initial holders
- [ ] Swap snapshot strategy membership NFTs (or memberships + RARI)
