"use client"

/**
 * ============================================================================
 * MICRO-DEBATE ARENA - MAIN UI COMPONENT
 * ============================================================================
 * 
 * This is the main UI for the Micro-Debate Arena dApp on IOTA.
 * Users can create debates and join sides.
 * 
 * ============================================================================
 */

import { useState, useEffect } from "react"
import { useCurrentAccount, useIotaClient, useSignAndExecuteTransaction } from "@iota/dapp-kit"
import { Transaction } from "@iota/iota-sdk/transactions"
import { useNetworkVariable } from "@/lib/config"
import { Button, Container, Heading, Text } from "@radix-ui/themes"
import ClipLoader from "react-spinners/ClipLoader"

interface Debate {
  id: string
  topic: string
  description: string
  sideACount: number
  sideBCount: number
  totalParticipants: number
  participants: Map<string, number>
}

const SampleIntegration = () => {
  const currentAccount = useCurrentAccount()
  const packageId = useNetworkVariable("packageId")
  const iotaClient = useIotaClient()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  
  const [debates, setDebates] = useState<Debate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null)
  const [txStatus, setTxStatus] = useState<string>("")
  const [userJoinedSides, setUserJoinedSides] = useState<Map<string, number>>(new Map())

  const isConnected = !!currentAccount

  // Fetch all debates
  useEffect(() => {
    if (!packageId || !isConnected) return

    const fetchDebates = async () => {
      try {
        setIsFetching(true)
        
        // 1. Query DebateCreated events to get all debate IDs
        const createdEvents = await iotaClient.queryEvents({
          query: {
            MoveEventType: `${packageId}::contract::DebateCreated`,
          },
          limit: 50,
        })

        console.log("DebateCreated events:", createdEvents)

        if (!createdEvents.data || createdEvents.data.length === 0) {
          setDebates([])
          setIsFetching(false)
          return
        }

        // Get debate IDs from events
        const debateIds = createdEvents.data
          .map((event: any) => event.parsedJson?.debate_id)
          .filter(Boolean)

        console.log("Debate IDs found:", debateIds)

        // 2. Query JoinedDebate events to track user participation
        const joinedEvents = await iotaClient.queryEvents({
          query: {
            MoveEventType: `${packageId}::contract::JoinedDebate`,
          },
          limit: 500,
        })

        console.log("JoinedDebate events:", joinedEvents)

        // Build a map of user joined sides for each debate
        const userJoinsMap = new Map<string, number>()
        joinedEvents.data.forEach((event: any) => {
          const parsed = event.parsedJson
          if (parsed && parsed.participant === currentAccount?.address) {
            userJoinsMap.set(parsed.debate_id, parsed.side)
          }
        })

        setUserJoinedSides(userJoinsMap)

        // 3. Fetch each debate object to get current counts
        const debatePromises = debateIds.map((id: string) =>
          iotaClient.getObject({
            id,
            options: {
              showContent: true,
              showOwner: true,
            },
          }).catch(err => {
            console.error(`Error fetching debate ${id}:`, err)
            return null
          })
        )

        const debateObjects = await Promise.all(debatePromises)

        const debateList: Debate[] = debateObjects
          .map((obj) => {
            if (!obj || !obj.data) return null
            const data = obj.data
            if (data.content?.dataType !== "moveObject") return null

            const fields = data.content.fields as any
            console.log("Debate fields:", fields)

            return {
              id: data.objectId,
              topic: fields.topic || "",
              description: fields.description || "",
              sideACount: parseInt(fields.side_a_count || "0"),
              sideBCount: parseInt(fields.side_b_count || "0"),
              totalParticipants: parseInt(fields.total_participants || "0"),
              participants: new Map(),
            }
          })
          .filter((d): d is Debate => d !== null)
          // Sort by most participants
          .sort((a, b) => b.totalParticipants - a.totalParticipants)

        console.log("Debates loaded:", debateList)
        console.log("User joined sides:", userJoinsMap)
        setDebates(debateList)
      } catch (error) {
        console.error("Error fetching debates:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchDebates()
    const interval = setInterval(fetchDebates, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [packageId, isConnected, iotaClient, currentAccount])

  // Create debate
  const handleCreateDebate = async () => {
    if (!topic.trim() || !description.trim()) {
      alert("Please fill in both topic and description")
      return
    }

    setIsLoading(true)
    setTxStatus("Creating debate...")

    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${packageId}::contract::create_debate`,
        arguments: [tx.pure.string(topic), tx.pure.string(description)],
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Debate created:", result)
            setTxStatus("✓ Debate created successfully!")
            setTopic("")
            setDescription("")
            setShowCreateForm(false)
            setTimeout(() => setTxStatus(""), 3000)
          },
          onError: (error) => {
            console.error("Error creating debate:", error)
            setTxStatus("✗ Failed to create debate")
            setTimeout(() => setTxStatus(""), 3000)
          },
        }
      )
    } catch (error) {
      console.error("Error:", error)
      setTxStatus("✗ Failed to create debate")
      setTimeout(() => setTxStatus(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  // Join debate
  const handleJoinDebate = async (debateId: string, side: 0 | 1) => {
    setIsLoading(true)
    setTxStatus(`Joining Side ${side === 0 ? "A" : "B"}...`)

    try {
      const tx = new Transaction()
      tx.moveCall({
        target: `${packageId}::contract::join_debate`,
        arguments: [tx.object(debateId), tx.pure.u8(side)],
      })

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log("Joined debate:", result)
            setTxStatus(`✓ Joined Side ${side === 0 ? "A" : "B"}!`)
            setTimeout(() => setTxStatus(""), 3000)
          },
          onError: (error) => {
            console.error("Error joining debate:", error)
            setTxStatus("✗ Failed to join debate")
            setTimeout(() => setTxStatus(""), 3000)
          },
        }
      )
    } catch (error) {
      console.error("Error:", error)
      setTxStatus("✗ Failed to join debate")
      setTimeout(() => setTxStatus(""), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div style={{ minHeight: "calc(100vh - 200px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🗳️</div>
          <Heading size="6" style={{ marginBottom: "1rem" }}>Micro-Debate Arena</Heading>
          <Text style={{ color: "var(--gray-11)" }}>
            Connect your wallet to create debates and join discussions
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "calc(100vh - 200px)", padding: "2rem", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", backgroundAttachment: "fixed" }}>
      <Container style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem", color: "white" }}>
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🗳️</div>
          <Heading size="8" style={{ marginBottom: "0.5rem", color: "white" }}>Micro-Debate Arena</Heading>
          <Text size="4" style={{ color: "rgba(255,255,255,0.9)" }}>
            Choose your side. Make your voice heard.
          </Text>
        </div>

        {/* Status Message */}
        {txStatus && (
          <div style={{ 
            marginBottom: "2rem", 
            padding: "1rem", 
            background: txStatus.startsWith("✓") ? "rgba(34, 197, 94, 0.2)" : txStatus.startsWith("✗") ? "rgba(239, 68, 68, 0.2)" : "rgba(59, 130, 246, 0.2)", 
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            textAlign: "center",
            fontWeight: "600"
          }}>
            {txStatus}
          </div>
        )}

        {/* Create Debate Button/Form */}
        <div style={{ marginBottom: "2rem" }}>
          {!showCreateForm ? (
            <Button
              size="3"
              onClick={() => setShowCreateForm(true)}
              style={{ 
                background: "white", 
                color: "#667eea",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              + Create New Debate
            </Button>
          ) : (
            <div style={{ background: "white", borderRadius: "16px", padding: "2rem", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <Heading size="5" style={{ color: "#1f2937" }}>Create New Debate</Heading>
                <button
                  onClick={() => setShowCreateForm(false)}
                  style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#666" }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ marginBottom: "1rem" }}>
                <Text size="2" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>Topic</Text>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Cats vs Dogs"
                  maxLength={100}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem", 
                    border: "2px solid #e5e7eb", 
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    color: "#1f2937"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <Text size="2" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1f2937" }}>Description</Text>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Which makes a better pet?"
                  maxLength={500}
                  style={{ 
                    width: "100%", 
                    padding: "0.75rem", 
                    border: "2px solid #e5e7eb", 
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "100px",
                    resize: "vertical",
                    outline: "none",
                    color: "#1f2937"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Button
                  size="3"
                  onClick={handleCreateDebate}
                  disabled={isLoading}
                  style={{ flex: 1, background: "#667eea", cursor: "pointer" }}
                >
                  {isLoading ? <ClipLoader size={16} color="white" /> : "Create Debate"}
                </Button>
                <Button
                  size="3"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  style={{ cursor: "pointer" }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Debates List */}
        {isFetching && debates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "white" }}>
            <ClipLoader size={40} color="white" />
            <Text style={{ marginTop: "1rem", color: "white" }}>Loading debates...</Text>
          </div>
        ) : debates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "2px dashed rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
            <Text size="5" style={{ color: "white", display: "block", marginBottom: "0.5rem" }}>No debates yet</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)" }}>Be the first to create a debate!</Text>
          </div>
        ) : (
          <>
            <Heading size="6" style={{ marginBottom: "1.5rem", color: "white" }}>
              Active Debates ({debates.length})
            </Heading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
              {debates.map((debate) => {
                const total = debate.sideACount + debate.sideBCount
                const sideAPercent = total > 0 ? (debate.sideACount / total) * 100 : 50
                const sideBPercent = total > 0 ? (debate.sideBCount / total) * 100 : 50
                const isExpanded = expandedDebate === debate.id
                const userSide = userJoinedSides.get(debate.id)
                const hasJoined = userSide !== undefined

                return (
                  <div
                    key={debate.id}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      transition: "transform 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <div style={{ padding: "1.5rem" }}>
                      <Heading size="4" style={{ marginBottom: "0.5rem", color: "#1f2937" }}>
                        {debate.topic}
                      </Heading>
                      <Text size="2" style={{ color: "#6b7280", display: "block", marginBottom: "1rem", lineHeight: "1.5" }}>
                        {debate.description}
                      </Text>

                      {/* Stats */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
                        <span>👥</span>
                        <span>{total} participants</span>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600", marginBottom: "0.25rem" }}>
                          <span style={{ color: "#3b82f6" }}>Side A: {debate.sideACount}</span>
                          <span style={{ color: "#a855f7" }}>Side B: {debate.sideBCount}</span>
                        </div>
                        <div style={{ position: "relative", height: "12px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
                          <div style={{ position: "absolute", height: "100%", background: "#3b82f6", width: `${sideAPercent}%`, transition: "width 0.3s" }} />
                          <div style={{ position: "absolute", height: "100%", background: "#a855f7", width: `${sideBPercent}%`, left: `${sideAPercent}%`, transition: "width 0.3s, left 0.3s" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                          <span>{sideAPercent.toFixed(1)}%</span>
                          <span>{sideBPercent.toFixed(1)}%</span>
                        </div>
                      </div>

                      {/* Join Buttons or Status */}
                      {hasJoined ? (
                        <div style={{ 
                          background: userSide === 0 ? "#dbeafe" : "#f3e8ff", 
                          border: userSide === 0 ? "2px solid #3b82f6" : "2px solid #a855f7",
                          borderRadius: "8px", 
                          padding: "0.75rem", 
                          textAlign: "center" 
                        }}>
                          <Text style={{ 
                            fontWeight: "600", 
                            color: userSide === 0 ? "#1e40af" : "#7c3aed",
                            fontSize: "0.875rem"
                          }}>
                            ✓ You joined Side {userSide === 0 ? "A" : "B"}
                          </Text>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <Button
                            size="2"
                            onClick={() => handleJoinDebate(debate.id, 0)}
                            disabled={isLoading}
                            style={{ flex: 1, background: "#3b82f6", cursor: "pointer" }}
                          >
                            Join Side A
                          </Button>
                          <Button
                            size="2"
                            onClick={() => handleJoinDebate(debate.id, 1)}
                            disabled={isLoading}
                            style={{ flex: 1, background: "#a855f7", cursor: "pointer" }}
                          >
                            Join Side B
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Details Toggle */}
                    <button
                      onClick={() => setExpandedDebate(isExpanded ? null : debate.id)}
                      style={{ 
                        width: "100%", 
                        background: "#f9fafb", 
                        padding: "0.75rem", 
                        border: "none", 
                        borderTop: "1px solid #e5e7eb",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "#6b7280"
                      }}
                    >
                      {isExpanded ? "Hide Details ▲" : "Show Details ▼"}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{ padding: "1.5rem", background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                        <Text size="1" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#6b7280" }}>
                          Debate ID
                        </Text>
                        <Text size="1" style={{ fontFamily: "monospace", wordBreak: "break-all", color: "#9ca3af" }}>
                          {debate.id}
                        </Text>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}

export default SampleIntegration
