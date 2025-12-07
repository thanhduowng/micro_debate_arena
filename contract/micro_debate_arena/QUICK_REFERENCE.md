# Micro-Debate Arena - Quick Reference

## Smart Contract Overview

**Module:** `micro_debate_arena::contract`

### Data Structure

Each `Debate` contains:
- `topic`: String - The debate topic
- `description`: String - Detailed description
- `side_a_count`: u64 - Number of Side A participants
- `side_b_count`: u64 - Number of Side B participants  
- `total_participants`: u64 - Total participants
- `participants`: Table - Tracks which side each address joined

### Rules
- ✅ Anyone can create a debate
- ✅ Each address can join only ONE side per debate
- ✅ Side A = 0, Side B = 1
- ❌ No tokens, no staking, no rewards
- ❌ Cannot switch sides once joined
- ❌ Cannot join the same debate twice

---

## Quick Command Reference

### Setup Commands

```bash
# Install IOTA CLI
cargo install --locked --git https://github.com/iotaledger/iota.git --branch develop iota

# Configure testnet
iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe:443
iota client switch --env testnet

# Create new address
iota client new-address ed25519

# Get testnet tokens
iota client faucet

# Check balance
iota client gas
```

### Build & Deploy

```bash
# Navigate to contract directory
cd contract/micro_debate_arena

# Build the contract
iota move build

# Deploy to testnet
iota client publish --gas-budget 100000000

# Save the Package ID from output!
```

### Interact with Contract

Replace `<PACKAGE_ID>` and `<DEBATE_ID>` with your actual values.

#### Create a Debate
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function create_debate \
  --args "Your Topic" "Your Description" \
  --gas-budget 10000000
```

**Example Topics:**
- "Cats vs Dogs" / "Which makes a better pet?"
- "Coffee vs Tea" / "Which is the superior morning beverage?"
- "Remote Work" / "Should companies allow permanent remote work?"

#### Join Side A (0)
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function join_debate \
  --args <DEBATE_ID> 0 \
  --gas-budget 10000000
```

#### Join Side B (1)
```bash
iota client call \
  --package <PACKAGE_ID> \
  --module contract \
  --function join_debate \
  --args <DEBATE_ID> 1 \
  --gas-budget 10000000
```

#### View Debate Info
```bash
iota client object <DEBATE_ID>
```

#### Switch Address (to join from different account)
```bash
# List all addresses
iota client addresses

# Switch to specific address
iota client switch --address <ADDRESS>
```

---

## Example Scenarios

### Scenario 1: Simple Debate

```bash
# Alice creates a debate
iota client call \
  --package 0xabc123... \
  --module contract \
  --function create_debate \
  --args "Tabs vs Spaces" "Which should you use for indentation?" \
  --gas-budget 10000000

# Alice joins Side A (Tabs)
iota client call \
  --package 0xabc123... \
  --module contract \
  --function join_debate \
  --args 0xdebate456... 0 \
  --gas-budget 10000000

# Bob switches to his address and joins Side B (Spaces)
iota client switch --address 0xbob789...
iota client call \
  --package 0xabc123... \
  --module contract \
  --function join_debate \
  --args 0xdebate456... 1 \
  --gas-budget 10000000

# Check results
iota client object 0xdebate456...
```

### Scenario 2: Multiple Debates

```bash
# Create debate 1
iota client call --package <PKG> --module contract \
  --function create_debate \
  --args "Pineapple on Pizza" "Yes or No?" \
  --gas-budget 10000000

# Create debate 2  
iota client call --package <PKG> --module contract \
  --function create_debate \
  --args "Vim vs Emacs" "Which is better?" \
  --gas-budget 10000000

# Same user can join different debates
iota client call --package <PKG> --module contract \
  --function join_debate --args <DEBATE_1_ID> 0 --gas-budget 10000000

iota client call --package <PKG> --module contract \
  --function join_debate --args <DEBATE_2_ID> 1 --gas-budget 10000000
```

---

## Testing Checklist

- [ ] Deploy contract successfully
- [ ] Create a debate and note the Object ID
- [ ] Join Side A from address 1
- [ ] Try to join again from same address (should fail with E_ALREADY_JOINED)
- [ ] Switch to address 2 and join Side B
- [ ] View debate object to see counts
- [ ] Create multiple debates
- [ ] Join different debates from the same address

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Insufficient gas" | Run `iota client faucet` to get more tokens |
| "Already joined" error | Each address can only join once per debate |
| "Invalid side" error | Use 0 for Side A or 1 for Side B |
| Can't find package | Make sure you saved Package ID from deployment |
| Can't find debate | Make sure you saved Debate Object ID from creation |

---

## View Functions (Public Getters)

These functions allow you to read debate data:

```move
// Get debate topic
public fun get_topic(debate: &Debate): String

// Get debate description  
public fun get_description(debate: &Debate): String

// Get Side A participant count
public fun get_side_a_count(debate: &Debate): u64

// Get Side B participant count
public fun get_side_b_count(debate: &Debate): u64

// Get total participants
public fun get_total_participants(debate: &Debate): u64

// Check if address has joined
public fun has_joined(debate: &Debate, participant: address): bool

// Get which side an address joined (if any)
public fun get_participant_side(debate: &Debate, participant: address): Option<u8>
```

---

## Events Emitted

### DebateCreated
```move
{
  debate_id: ID,
  topic: String,
  description: String,
  creator: address
}
```

### JoinedDebate
```move
{
  debate_id: ID,
  participant: address,
  side: u8  // 0 = Side A, 1 = Side B
}
```

---

## JSON Output Mode

For programmatic access, add `--json` flag:

```bash
# Deploy and capture Package ID
PACKAGE_ID=$(iota client publish --gas-budget 100000000 --json | \
  jq -r '.objectChanges[] | select(.type=="published") | .packageId')

# Create debate and capture Debate ID
DEBATE_ID=$(iota client call \
  --package $PACKAGE_ID \
  --module contract \
  --function create_debate \
  --args "Topic" "Description" \
  --gas-budget 10000000 \
  --json | \
  jq -r '.objectChanges[] | select(.objectType | contains("Debate")) | .objectId')

echo "Package: $PACKAGE_ID"
echo "Debate: $DEBATE_ID"
```

---

## Additional Resources

- **IOTA Docs**: https://docs.iota.org/
- **Move Book**: https://move-language.github.io/move/
- **IOTA Explorer**: https://explorer.iota.org/
- **IOTA Discord**: https://discord.iota.org/

---

## Contract Features Summary

✨ **What it does:**
- Create debates on any topic
- Join Side A or Side B
- Track participant counts
- Emit events for indexing

🚫 **What it doesn't do:**
- No token transfers
- No staking or rewards
- No voting weights
- No time limits
- No winner determination
- No governance

This is a **simple participation tracking system** - perfect for learning Move on IOTA!
