# Micro-Debate Arena - Deployment Guide

## Overview
This guide will walk you through building and deploying the Micro-Debate Arena smart contract on IOTA testnet.

## Prerequisites

1. **Install IOTA CLI**
   ```bash
   cargo install --locked --git https://github.com/iotaledger/iota.git --branch develop iota
   ```

2. **Set up IOTA Testnet**
   ```bash
   # Configure IOTA CLI for testnet
   iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe:443
   
   # Switch to testnet
   iota client switch --env testnet
   ```

3. **Create or Import a Wallet**
   ```bash
   # Create a new address
   iota client new-address ed25519
   
   # Or import an existing one
   iota keytool import "your-mnemonic-phrase" ed25519
   ```

4. **Get Testnet Tokens**
   ```bash
   # Request tokens from faucet
   iota client faucet
   
   # Check your balance
   iota client gas
   ```

## Building the Contract

Navigate to the contract directory:
```bash
cd contract/micro_debate_arena
```

Build the Move package:
```bash
iota move build
```

If the build is successful, you should see output indicating the package was built successfully.

## Deploying to IOTA Testnet

Deploy the contract to testnet:
```bash
iota client publish --gas-budget 100000000
```

**Save the following from the deployment output:**
- **Package ID**: This is the deployed package address (starts with `0x`)
- **Debate Module**: Look for `micro_debate_arena::contract`

Example output:
```
Created Objects:
  ┌──
  │ ObjectID: 0x123abc...
  │ Sender: 0xabc123...
  │ Owner: Immutable
  │ ObjectType: 0x2::package::UpgradeCap
  
Published Objects:
  ┌──
  │ PackageID: 0xPACKAGE_ID_HERE...
  │ Modules: micro_debate_arena::contract
```

Save your **Package ID** - you'll need it for all interactions!

## Interacting with the Contract

### 1. Create a Debate

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function create_debate \
  --args "Cats vs Dogs" "Which makes a better pet?" \
  --gas-budget 10000000
```

**From the output, save the Debate Object ID** - you'll need it to interact with this specific debate.

Look for:
```
Created Objects:
  ┌──
  │ ObjectID: 0xDEBATE_OBJECT_ID...
  │ Owner: Shared
```

### 2. Join Side A (side = 0)

```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function join_debate \
  --args <DEBATE_OBJECT_ID> 0 \
  --gas-budget 10000000
```

### 3. Join Side B (side = 1)

From a different wallet/address:
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function join_debate \
  --args <DEBATE_OBJECT_ID> 1 \
  --gas-budget 10000000
```

### 4. View Debate Information

```bash
iota client object <DEBATE_OBJECT_ID>
```

This will show you:
- Topic and description
- `side_a_count`: Number of Side A participants
- `side_b_count`: Number of Side B participants
- `total_participants`: Total participants

## Example Full Workflow

```bash
# 1. Deploy the contract
PACKAGE_ID=$(iota client publish --gas-budget 100000000 --json | jq -r '.objectChanges[] | select(.type=="published") | .packageId')
echo "Package ID: $PACKAGE_ID"

# 2. Create a debate and capture the object ID
DEBATE_ID=$(iota client call \
  --package $PACKAGE_ID \
  --module contract \
  --function create_debate \
  --args "Pineapple on Pizza" "Should pineapple be allowed on pizza?" \
  --gas-budget 10000000 \
  --json | jq -r '.objectChanges[] | select(.objectType | contains("Debate")) | .objectId')
echo "Debate ID: $DEBATE_ID"

# 3. Join Side A (Against pineapple)
iota client call \
  --package $PACKAGE_ID \
  --module contract \
  --function join_debate \
  --args $DEBATE_ID 0 \
  --gas-budget 10000000

# 4. Switch to another address and join Side B (For pineapple)
iota client switch --address <ANOTHER_ADDRESS>
iota client call \
  --package $PACKAGE_ID \
  --module contract \
  --function join_debate \
  --args $DEBATE_ID 1 \
  --gas-budget 10000000

# 5. View the debate results
iota client object $DEBATE_ID
```

## View Functions

The contract provides several view functions you can call:

- `get_topic(debate: &Debate): String`
- `get_description(debate: &Debate): String`
- `get_side_a_count(debate: &Debate): u64`
- `get_side_b_count(debate: &Debate): u64`
- `get_total_participants(debate: &Debate): u64`
- `has_joined(debate: &Debate, participant: address): bool`

## Error Codes

- **E_ALREADY_JOINED (1)**: You've already joined this debate
- **E_INVALID_SIDE (2)**: Side must be 0 (Side A) or 1 (Side B)

## Events

The contract emits two types of events:

1. **DebateCreated**: Emitted when a new debate is created
   - `debate_id`: The object ID of the debate
   - `topic`: The debate topic
   - `description`: The debate description
   - `creator`: Address of the creator

2. **JoinedDebate**: Emitted when someone joins a debate
   - `debate_id`: The object ID of the debate
   - `participant`: Address of the participant
   - `side`: Which side they joined (0 or 1)

## Troubleshooting

**Build Errors:**
- Make sure you're in the correct directory with `Move.toml`
- Verify IOTA CLI is properly installed: `iota --version`

**Deployment Errors:**
- Ensure you have enough gas: `iota client gas`
- Request more from faucet if needed: `iota client faucet`

**Transaction Errors:**
- **Already joined**: Each address can only join once per debate
- **Invalid side**: Use 0 for Side A, 1 for Side B
- **Object not found**: Make sure you're using the correct debate object ID

## Next Steps

- Create multiple debates on different topics
- Track debate results using events
- Build a frontend to interact with the contract
- Explore IOTA's TypeScript SDK for programmatic interactions

## Resources

- [IOTA Documentation](https://docs.iota.org/)
- [Move Language Book](https://move-language.github.io/move/)
- [IOTA Developer Portal](https://wiki.iota.org/build/introduction/)
