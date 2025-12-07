// Copyright (c) Mysten Labs, Inc.
// Modifications Copyright (c) 2024 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0

/// Micro-Debate Arena
/// A simple smart contract for creating micro debates on simple topics.
/// Users can create debates and join either Side A or Side B.
/// Each address can only join one side per debate.
module micro_debate_arena::contract {
    use std::string::String;
    use iota::event;
    use iota::table::{Self, Table};

    // ======== Error Codes ========

    /// Error: User has already joined this debate
    const E_ALREADY_JOINED: u64 = 1;
    
    /// Error: Invalid side (must be 0 for Side A or 1 for Side B)
    const E_INVALID_SIDE: u64 = 2;

    // ======== Structs ========

    /// Main debate object that holds all debate information
    /// This is a shared object that anyone can interact with
    public struct Debate has key {
        id: UID,
        /// The debate topic
        topic: String,
        /// Detailed description of the debate
        description: String,
        /// Number of participants who joined Side A
        side_a_count: u64,
        /// Number of participants who joined Side B
        side_b_count: u64,
        /// Total number of participants (Side A + Side B)
        total_participants: u64,
        /// Tracks which side each address has joined (address -> side)
        /// 0 = Side A, 1 = Side B
        participants: Table<address, u8>,
    }

    // ======== Events ========

    /// Event emitted when a new debate is created
    public struct DebateCreated has copy, drop {
        /// The object ID of the newly created debate
        debate_id: ID,
        /// The debate topic
        topic: String,
        /// The debate description
        description: String,
        /// Address of the creator
        creator: address,
    }

    /// Event emitted when a user joins a debate
    public struct JoinedDebate has copy, drop {
        /// The object ID of the debate
        debate_id: ID,
        /// Address of the participant
        participant: address,
        /// Which side they joined (0 = Side A, 1 = Side B)
        side: u8,
    }

    // ======== Public Functions ========

    /// Create a new debate with a topic and description
    /// This creates a shared object that anyone can interact with
    /// 
    /// # Arguments
    /// * `topic` - The debate topic (e.g., "Cats vs Dogs")
    /// * `description` - Detailed description (e.g., "Which makes a better pet?")
    /// * `ctx` - Transaction context
    public entry fun create_debate(
        topic: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let debate_id = object::new(ctx);
        let debate_id_copy = object::uid_to_inner(&debate_id);
        
        let debate = Debate {
            id: debate_id,
            topic,
            description,
            side_a_count: 0,
            side_b_count: 0,
            total_participants: 0,
            participants: table::new(ctx),
        };

        // Emit event to notify about new debate creation
        event::emit(DebateCreated {
            debate_id: debate_id_copy,
            topic: debate.topic,
            description: debate.description,
            creator: ctx.sender(),
        });

        // Share the debate object so anyone can join
        transfer::share_object(debate);
    }

    /// Join a debate by choosing Side A or Side B
    /// Each address can only join once per debate
    /// 
    /// # Arguments
    /// * `debate` - Mutable reference to the debate object
    /// * `side` - Which side to join (0 = Side A, 1 = Side B)
    /// * `ctx` - Transaction context
    /// 
    /// # Errors
    /// * `E_ALREADY_JOINED` - If the user has already joined this debate
    /// * `E_INVALID_SIDE` - If side is not 0 or 1
    public entry fun join_debate(
        debate: &mut Debate,
        side: u8,
        ctx: &mut TxContext
    ) {
        let sender = ctx.sender();
        
        // Validate that side is either 0 (Side A) or 1 (Side B)
        assert!(side == 0 || side == 1, E_INVALID_SIDE);
        
        // Check if user has already joined this debate
        assert!(!table::contains(&debate.participants, sender), E_ALREADY_JOINED);
        
        // Record which side the user joined
        table::add(&mut debate.participants, sender, side);
        
        // Update the participant counts
        if (side == 0) {
            debate.side_a_count = debate.side_a_count + 1;
        } else {
            debate.side_b_count = debate.side_b_count + 1;
        };
        
        debate.total_participants = debate.total_participants + 1;
        
        // Emit event to notify about the new participant
        event::emit(JoinedDebate {
            debate_id: object::uid_to_inner(&debate.id),
            participant: sender,
            side,
        });
    }

    // ======== View Functions ========

    /// Get the debate topic
    public fun get_topic(debate: &Debate): String {
        debate.topic
    }

    /// Get the debate description
    public fun get_description(debate: &Debate): String {
        debate.description
    }

    /// Get the number of participants on Side A
    public fun get_side_a_count(debate: &Debate): u64 {
        debate.side_a_count
    }

    /// Get the number of participants on Side B
    public fun get_side_b_count(debate: &Debate): u64 {
        debate.side_b_count
    }

    /// Get the total number of participants
    public fun get_total_participants(debate: &Debate): u64 {
        debate.total_participants
    }

    /// Check which side a specific address has joined (if any)
    /// Returns None if the address hasn't joined
    public fun get_participant_side(debate: &Debate, participant: address): Option<u8> {
        if (table::contains(&debate.participants, participant)) {
            option::some(*table::borrow(&debate.participants, participant))
        } else {
            option::none()
        }
    }

    /// Check if an address has already joined this debate
    public fun has_joined(debate: &Debate, participant: address): bool {
        table::contains(&debate.participants, participant)
    }
}

