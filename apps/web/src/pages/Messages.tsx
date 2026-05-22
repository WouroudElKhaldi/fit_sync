import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import NotificationModal from "../components/NotificationModal";

type UserMini = {
  id: string;
  fullName: string;
  role: "USER" | "TRAINER" | "ADMIN";
};

type GroupMini = {
  id: string;
  name: string;
};

type WorkoutPlanMini = {
  id: string;
  title: string;
};

type DbMessage = {
  id: string;
  senderId: string;
  receiverId: string | null;
  groupId: string | null;
  content: string;
  isRead: boolean;
  workoutPlanId: string | null;
  createdAt: string;
  sender: UserMini;
  receiver?: UserMini | null;
  group?: GroupMini | null;
  workoutPlan?: WorkoutPlanMini | null;
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  unreadCount: number;
  rawTime: string;
  isOnline?: boolean;
  lastActiveAt?: string | null;
};

type PendingInvitation = {
  id: string;
  groupId: string;
  status: string;
  group: {
    id: string;
    name: string;
    createdBy: {
      id: string;
      fullName: string;
    };
  };
};

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: "TRAINER" | "ADMIN";
};

type WorkoutPlan = {
  id: string;
  title: string;
  description?: string;
  createdById: string;
};

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "groups">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Sockets & Reload triggers
  const [socket, setSocket] = useState<Socket | null>(null);
  const [reloadConversationsTrigger, setReloadConversationsTrigger] = useState(0);
  const [reloadHistoryTrigger, setReloadHistoryTrigger] = useState(0);

  // Group creation state
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Group invitation state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [inviteSearch, setInviteSearch] = useState("");

  // Pending invites state
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([]);
  const [showInvitesPanel, setShowInvitesPanel] = useState(false);

  // Network / Connections state
  const [showNetworkPanel, setShowNetworkPanel] = useState(false);
  const [pendingConnections, setPendingConnections] = useState<any[]>([]);
  const [connectionsList, setConnectionsList] = useState<any[]>([]);
  const [discoveryUsers, setDiscoveryUsers] = useState<any[]>([]);
  const [discoverySearch, setDiscoverySearch] = useState("");

  // Workout linking state
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sidebar open/close toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "danger" | "warning" | "success";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

  // Chat Settings state
  const [showChatSettingsMenu, setShowChatSettingsMenu] = useState(false);
  const [showRenameGroupModal, setShowRenameGroupModal] = useState(false);
  const [groupRenameInput, setGroupRenameInput] = useState("");
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [groupMembers, setGroupMembers] = useState<any[]>([]); // To list members for removal

  // Establish Sockets Connection
  useEffect(() => {
    if (!user) return;

    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("WebSocket connected. Registering userId:", user.id);
      newSocket.emit("register_user", { userId: user.id });
    });

    newSocket.on("receive_message", (message: DbMessage) => {
      // Check if message is for the active conversation
      const isActiveGroup = message.groupId && message.groupId === activeChatId;
      const isActivePrivate =
        !message.groupId &&
        activeChatId &&
        ((message.senderId === user.id && message.receiverId === activeChatId) ||
          (message.senderId === activeChatId && message.receiverId === user.id));

      if (isActiveGroup || isActivePrivate) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });

        // Mark private message as read
        if (!message.groupId && message.receiverId === user.id) {
          const token = localStorage.getItem("fitsync_token");
          fetch(`http://localhost:3000/messages/${message.id}/read`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId: user.id }),
          }).catch((err) => console.error("Error marking message read:", err));
        }
      }

      // Update sidebar conversation preview or trigger refetch
      setReloadConversationsTrigger((prev) => prev + 1);
    });

    newSocket.on("new_notification", (notif: any) => {
      console.log("Real-time notification received:", notif);
      setReloadConversationsTrigger((prev) => prev + 1);
      // Fetch invitations if they have a group invite
      if (notif.type === "GROUP_INVITATION" || notif.message?.toLowerCase().includes("invite")) {
        fetchPendingInvitations();
      }
      if (notif.type === "CONNECTION_REQUEST" || notif.message?.toLowerCase().includes("connect")) {
        fetchPendingConnections();
        fetchDiscoveryUsers(discoverySearch);
      }
    });

    newSocket.on("user_status_change", (status: { userId: string; isOnline: boolean; lastActiveAt: string | null }) => {
      console.log("Real-time presence change received:", status);
      // Update conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === status.userId
            ? { ...c, isOnline: status.isOnline, lastActiveAt: status.lastActiveAt }
            : c
        )
      );
      // Update My Network list
      setConnectionsList((prev) =>
        prev.map((c) =>
          c.otherUser.id === status.userId
            ? { ...c, otherUser: { ...c.otherUser, isOnline: status.isOnline, lastActiveAt: status.lastActiveAt } }
            : c
        )
      );
      // Update Discovery list
      setDiscoveryUsers((prev) =>
        prev.map((u) =>
          u.id === status.userId
            ? { ...u, isOnline: status.isOnline, lastActiveAt: status.lastActiveAt }
            : u
        )
      );
    });

    return () => {
      newSocket.close();
    };
  }, [user, activeChatId]);

  // Fetch unified recent conversations
  const fetchConversations = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/conversations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        // Default to first chat if no chat is currently selected and chats exist
        if (data.length > 0 && !activeChatId) {
          setActiveChatId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  // Advanced Chat Functions
  const handleClearChat = async () => {
    if (!user || !activeChatId) return;
    const activeConv = conversations.find((c) => c.id === activeChatId);
    if (!activeConv) return;
    
    const token = localStorage.getItem("fitsync_token");
    const payload = {
      userId: user.id,
      groupId: activeConv.isGroup ? activeChatId : undefined,
      otherUserId: !activeConv.isGroup ? activeChatId : undefined,
    };

    try {
      const res = await fetch("http://localhost:3000/messages/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setReloadConversationsTrigger((prev) => prev + 1);
        setMessages([]); // Clear locally immediately
        setShowChatSettingsMenu(false);
      } else {
        const error = await res.json();
        setModalConfig({ isOpen: true, title: "Error", message: error.message || "Failed to clear chat", type: "danger", onConfirm: closeModal });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !activeChatId) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/block/${activeChatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ blockerId: user.id }),
      });
      if (res.ok) {
        setModalConfig({ isOpen: true, title: "User Blocked", message: "This user has been blocked. They can no longer message you.", type: "success", onConfirm: closeModal });
        setReloadConversationsTrigger((prev) => prev + 1);
        setActiveChatId(null);
        setShowChatSettingsMenu(false);
      } else {
        const error = await res.json();
        setModalConfig({ isOpen: true, title: "Error", message: error.message || "Failed to block user", type: "danger", onConfirm: closeModal });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async () => {
    if (!user || !activeChatId) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/groups/${activeChatId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId: user.id }),
      });
      if (res.ok) {
        setReloadConversationsTrigger((prev) => prev + 1);
        setActiveChatId(null);
        setShowChatSettingsMenu(false);
      } else {
        const error = await res.json();
        setModalConfig({ isOpen: true, title: "Error", message: error.message || "Failed to delete group", type: "danger", onConfirm: closeModal });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameGroup = async () => {
    if (!user || !activeChatId || !groupRenameInput.trim()) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/groups/${activeChatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId: user.id, name: groupRenameInput.trim() }),
      });
      if (res.ok) {
        setReloadConversationsTrigger((prev) => prev + 1);
        setShowRenameGroupModal(false);
        setShowChatSettingsMenu(false);
      } else {
        const error = await res.json();
        setModalConfig({ isOpen: true, title: "Error", message: error.message || "Failed to rename group", type: "danger", onConfirm: closeModal });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user, reloadConversationsTrigger]);

  // Fetch conversation messages
  const fetchMessages = async () => {
    if (!user || !activeChatId) {
      setMessages([]);
      return;
    }

    const activeConv = conversations.find((c) => c.id === activeChatId);
    const isGroup = activeConv ? activeConv.isGroup : false;
    const token = localStorage.getItem("fitsync_token");

    try {
      let res;
      if (isGroup) {
        res = await fetch(`http://localhost:3000/messages/conversation/${user.id}/group/${activeChatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        res = await fetch(`http://localhost:3000/messages/conversation/${user.id}?with=${activeChatId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Read messages in bulk
        await fetch(`http://localhost:3000/messages/read-all/${user.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ senderId: activeChatId }),
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, activeChatId, reloadHistoryTrigger]);

  // Fetch pending invitations
  const fetchPendingInvitations = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/invitations/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingInvites(data);
      }
    } catch (err) {
      console.error("Error fetching pending invites:", err);
    }
  };

  useEffect(() => {
    fetchPendingInvitations();
  }, [user]);

  // Fetch workout plans for linking (only plans created by the current user)
  const fetchWorkoutPlans = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/workouts/plans/trainer/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Always filter to only my own created plans — the backend may return all plans for admins
        const myPlans = data.filter((p: WorkoutPlan) => p.createdById === user.id);
        setWorkoutPlans(myPlans);
      }
    } catch (err) {
      console.error("Error loading workout plans:", err);
    }
  };


  // Fetch pending connections
  const fetchPendingConnections = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/connections/pending/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingConnections(data);
      }
    } catch (err) {
      console.error("Error fetching pending connections:", err);
    }
  };

  // Fetch accepted connections (My Network)
  const fetchConnections = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/connections/active/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionsList(data);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  // Fetch discovery directory
  const fetchDiscoveryUsers = async (search = "") => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(
        `http://localhost:3000/messages/connections/discovery/${user.id}${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setDiscoveryUsers(data);
      }
    } catch (err) {
      console.error("Error fetching discovery users:", err);
    }
  };

  const handleSendConnectionRequest = async (addresseeId: string) => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch("http://localhost:3000/messages/connections/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId: user.id, addresseeId }),
      });
      if (res.ok) {
        await res.json();
        if (socket && socket.connected) {
          socket.emit("connection_request_sent", {
            requesterId: user.id,
            addresseeId,
          });
        }
        fetchDiscoveryUsers(discoverySearch);
        setModalConfig({
          isOpen: true,
          title: "Connection Sent",
          message: "Your request has been dispatched. You will be able to message once they accept.",
          type: "success",
          onConfirm: closeModal,
        });
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to send connection request");
      }
    } catch (err: any) {
      console.error("Error sending connection request:", err);
      setModalConfig({
        isOpen: true,
        title: "Request Refused",
        message: err.message || "Failed to send connection request.",
        type: "danger",
        onConfirm: closeModal,
      });
    }
  };

  const handleRespondConnection = async (connectionId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/connections/${connectionId}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, status }),
      });
      if (res.ok) {
        fetchPendingConnections();
        fetchConnections();
        fetchDiscoveryUsers(discoverySearch);
        setReloadConversationsTrigger((prev) => prev + 1);

        if (socket && socket.connected) {
          socket.emit("register_user", { userId: user.id });
        }

        setModalConfig({
          isOpen: true,
          title: status === "ACCEPTED" ? "Connection Accepted" : "Request Declined",
          message: status === "ACCEPTED" ? "You are now connected and can chat!" : "You declined the connection request.",
          type: "success",
          onConfirm: closeModal,
        });
      } else {
        throw new Error("Failed to respond to connection request");
      }
    } catch (err) {
      console.error("Error responding to connection request:", err);
    }
  };

  const handleSelectConnectionChat = (otherUserId: string) => {
    const existingConv = conversations.find(c => !c.isGroup && c.id === otherUserId);
    if (existingConv) {
      setActiveChatId(existingConv.id);
      setReloadHistoryTrigger(prev => prev + 1);
    } else {
      setActiveChatId(otherUserId);
    }
    setShowNetworkPanel(false);
  };

  useEffect(() => {
    fetchWorkoutPlans();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPendingConnections();
      fetchConnections();
    }
  }, [user, reloadConversationsTrigger]);

  useEffect(() => {
    if (user) {
      fetchDiscoveryUsers(discoverySearch);
    }
  }, [user, discoverySearch]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId]);

  // Handle Send Message
  const handleSendMessage = () => {
    if ((!inputText.trim() && !selectedPlanId) || !activeChatId || !user) return;

    const activeConv = conversations.find((c) => c.id === activeChatId);
    const isGroup = activeConv ? activeConv.isGroup : false;

    const payload = {
      senderId: user.id,
      receiverId: isGroup ? undefined : activeChatId,
      groupId: isGroup ? activeChatId : undefined,
      content: inputText.trim() || `Shared Workout Protocol: ${workoutPlans.find(wp => wp.id === selectedPlanId)?.title}`,
      workoutPlanId: selectedPlanId || undefined,
    };

    if (socket && socket.connected) {
      socket.emit("send_message", payload);
    } else {
      // Rest fallback
      const token = localStorage.getItem("fitsync_token");
      fetch(`http://localhost:3000/messages/send/${user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("HTTP fallback send failed");
        })
        .then((msg) => {
          setMessages((prev) => [...prev, msg]);
          setReloadConversationsTrigger((prev) => prev + 1);
        })
        .catch((err) => console.error("Error sending message via fallback:", err));
    }

    setInputText("");
    setSelectedPlanId(null);
    setShowEmojiPicker(false);
    setShowPlanDropdown(false);
  };

  // Group Invitation Responses
  const handleRespondInvitation = async (membershipId: string, status: "ACCEPTED" | "REJECTED") => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/invitations/${membershipId}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id, status }),
      });

      if (res.ok) {
        // Refetch invitations & conversations
        fetchPendingInvitations();
        setReloadConversationsTrigger((prev) => prev + 1);

        // Re-register websocket to subscribe to new group room
        if (socket && socket.connected) {
          socket.emit("register_user", { userId: user.id });
        }

        setModalConfig({
          isOpen: true,
          title: status === "ACCEPTED" ? "Invitation Accepted" : "Invitation Declined",
          message: status === "ACCEPTED" ? "You have joined the group." : "You declined the group invitation.",
          type: "success",
          onConfirm: closeModal,
        });
      } else {
        throw new Error("Failed response");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Group Chat
  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch("http://localhost:3000/messages/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName.trim(), creatorId: user.id }),
      });

      if (res.ok) {
        const group = await res.json();
        setNewGroupName("");
        setShowCreateGroupModal(false);

        // Select new group and reload conversations
        setActiveChatId(group.id);
        setReloadConversationsTrigger((prev) => prev + 1);

        // Re-register websocket to subscribe to new group room
        if (socket && socket.connected) {
          socket.emit("register_user", { userId: user.id });
        }

        setModalConfig({
          isOpen: true,
          title: "Group Created",
          message: `The channel "${group.name}" is now online.`,
          type: "success",
          onConfirm: closeModal,
        });
      } else {
        throw new Error("Failed to create group");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load candidates for group invitation
  const handleOpenInviteModal = async () => {
    if (!user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/candidates/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
        setShowInviteModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Group Invitation
  const handleSendInvite = async (inviteeId: string) => {
    if (!activeChatId || !user) return;
    const token = localStorage.getItem("fitsync_token");
    try {
      const res = await fetch(`http://localhost:3000/messages/groups/${activeChatId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteeId, inviterId: user.id }),
      });

      if (res.ok) {
        // Emit real-time notification so invitee sees it immediately without refreshing
        if (socket && socket.connected) {
          socket.emit("group_invite_sent", {
            inviterId: user.id,
            inviteeId,
            groupId: activeChatId,
          });
        }

        const candidateName = candidates.find((c) => c.id === inviteeId)?.fullName || "User";
        setModalConfig({
          isOpen: true,
          title: "Invitation Sent",
          message: `Secure invite dispatched to ${candidateName}. Pending confirmation.`,
          type: "success",
          onConfirm: closeModal,
        });
      } else {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to dispatch invitation.");
      }
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        title: "Dispatch Refused",
        message: err.message || "Failed to invite candidate.",
        type: "danger",
        onConfirm: closeModal,
      });
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  // Active chat metadata
  const activeChat = conversations.find((c) => c.id === activeChatId) || (() => {
    const conn = connectionsList.find(c => c.otherUser.id === activeChatId);
    if (conn) {
      return {
        id: conn.otherUser.id,
        name: conn.otherUser.fullName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${conn.otherUser.id}`,
        isGroup: false,
        lastMessage: '',
        lastMessageTime: '',
        unread: false,
        unreadCount: 0,
        rawTime: '',
        isOnline: conn.otherUser.isOnline,
        lastActiveAt: conn.otherUser.lastActiveAt,
      };
    }
    return null;
  })();

  // Sidebar Filtered List
  const filteredChats = conversations.filter((chat) => {
    if (filter === "unread" && !chat.unread) return false;
    if (filter === "groups" && !chat.isGroup) return false;
    if (searchQuery && !chat.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full flex h-[calc(100vh-140px)] overflow-hidden rounded-[var(--radius-xl)] border border-secondary-container/10 bg-surface-container-low shadow-2xl relative">
      {/* Left Panel: Chat List / Hub */}
      <aside className={`border-r border-secondary-container/10 flex flex-col shrink-0 bg-surface-container-low/50 backdrop-blur-3xl transition-all duration-300 ease-in-out overflow-hidden ${
        isSidebarOpen ? "w-full md:w-64 lg:w-[350px]" : "w-0 border-r-0"
      }`}>
        <div className="px-4 pt-4 pb-3 border-b border-secondary-container/10 bg-surface-container-high/20">
          {/* Top row: title + collapse */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[16px]">forum</span>
              </div>
              <h3 className="text-sm font-bold text-on-surface tracking-tight leading-none">Comms Hub</h3>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high transition-all"
              title="Collapse"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          </div>

          {/* Action row: network, invites, create group */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-low/60 border border-secondary-container/10">
            {/* Network / Connections Button */}
            <button
              onClick={() => {
                setShowNetworkPanel(!showNetworkPanel);
                setShowInvitesPanel(false);
              }}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all ${
                showNetworkPanel
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              title="Network & Connections"
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span className="text-[9px] font-semibold leading-none">Network</span>
              {pendingConnections.length > 0 && (
                <div className="absolute top-1 right-2 w-4 h-4 bg-error text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {pendingConnections.length}
                </div>
              )}
            </button>

            <div className="w-px h-6 bg-secondary-container/20 shrink-0" />

            {/* Group Invites Button */}
            <button
              onClick={() => {
                setShowInvitesPanel(!showInvitesPanel);
                setShowNetworkPanel(false);
              }}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg transition-all ${
                showInvitesPanel
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
              title="Invitations"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span>
              <span className="text-[9px] font-semibold leading-none">Invites</span>
              {pendingInvites.length > 0 && (
                <div className="absolute top-1 right-2 w-4 h-4 bg-error text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-sm">
                  {pendingInvites.length}
                </div>
              )}
            </button>

            <div className="w-px h-6 bg-secondary-container/20 shrink-0" />

            {/* Create Group Button */}
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
              title="Create Group"
            >
              <span className="material-symbols-outlined text-[18px]">add_comment</span>
              <span className="text-[9px] font-semibold leading-none">New Group</span>
            </button>
          </div>


          <div className="relative w-full mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-secondary-container/20 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-on-surface-variant/30 font-medium shadow-inner"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5">
            {["all", "unread", "groups"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f as any);
                  setShowInvitesPanel(false);
                  setShowNetworkPanel(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  filter === f && !showInvitesPanel && !showNetworkPanel
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                    : "bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List Content: Conversations, Invitations or Network Panel */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {showNetworkPanel ? (
            // Network & Connections Panel
            <div className="p-6 space-y-6">
              {/* Pending Connection Requests Section */}
              {pendingConnections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2">Pending Requests</h4>
                  {pendingConnections.map((conn) => (
                    <div key={conn.id} className="p-4 rounded-xl bg-surface-container-high/40 border border-secondary-container/10 flex flex-col gap-3 shadow-md hover:border-primary/20 transition-all">
                      <div>
                        <span className="text-xs font-black text-on-surface block truncate">{conn.requester.fullName}</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary block mt-1">
                          {conn.requester.role} • @{conn.requester.username}
                        </span>
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => handleRespondConnection(conn.id, "ACCEPTED")}
                          className="flex-1 py-1.5 bg-emerald-500 text-on-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">check</span> Accept
                        </button>
                        <button
                          onClick={() => handleRespondConnection(conn.id, "REJECTED")}
                          className="flex-1 py-1.5 bg-surface-container-highest text-error text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-error/10 active:scale-95 transition-all border border-secondary-container/10 flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span> Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Discover Directory Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2">Discover Directory</h4>
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[16px]">person_search</span>
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border border-secondary-container/20 text-[10px] rounded-lg pl-9 pr-3 py-2 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30 font-black shadow-inner"
                    placeholder="Search trainers & admins..."
                    value={discoverySearch}
                    onChange={(e) => setDiscoverySearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                  {discoveryUsers.length === 0 ? (
                    <div className="text-center py-4 opacity-30 italic text-[10px]">No users found</div>
                  ) : (
                    discoveryUsers.map((u) => (
                      <div key={u.id} className="p-3 rounded-lg bg-surface-container-high/25 border border-secondary-container/5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-[11px] font-black text-on-surface block truncate">{u.fullName}</span>
                          <span className="text-[8px] font-black uppercase text-on-surface-variant/60 block">{u.role}</span>
                        </div>
                        {u.connectionStatus === "CONNECTED" ? (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-500/20">Connected</span>
                        ) : u.connectionStatus === "PENDING_SENT" ? (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest rounded border border-primary/20">Sent</span>
                        ) : u.connectionStatus === "PENDING_RECEIVED" ? (
                          <button
                            onClick={() => handleRespondConnection(u.connectionId, "ACCEPTED")}
                            className="px-2 py-1 bg-emerald-500 text-on-primary text-[8px] font-black uppercase tracking-widest rounded hover:brightness-110 active:scale-95 transition-all"
                          >
                            Accept
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendConnectionRequest(u.id)}
                            className="px-2.5 py-1 bg-primary text-on-primary text-[8px] font-black uppercase tracking-widest rounded hover:brightness-110 active:scale-95 transition-all shadow"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Network Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-2">My Network ({connectionsList.length})</h4>
                {connectionsList.length === 0 ? (
                  <div className="text-center py-6 opacity-30 italic text-[10px]">No active connections. Use discover above to connect.</div>
                ) : (
                  <div className="space-y-2">
                    {connectionsList.map((conn) => (
                      <div
                        key={conn.connectionId}
                        onClick={() => handleSelectConnectionChat(conn.otherUser.id)}
                        className="flex items-center justify-between p-3 rounded-lg bg-surface-container-high/20 border border-secondary-container/5 hover:bg-primary/[0.02] hover:border-primary/20 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-secondary-container/10">
                              <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${conn.otherUser.id}`} className="w-full h-full object-cover" alt="" />
                            </div>
                            {conn.otherUser.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-surface-container-low shadow-[0_0_5px_rgba(16,185,129,0.8)] animate-pulse"></div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-black text-on-surface block truncate">{conn.otherUser.fullName}</span>
                            <span className="text-[8px] font-black uppercase text-on-surface-variant/40 block mt-0.5">{conn.otherUser.role}</span>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant/20 hover:text-primary transition-colors">chat</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : showInvitesPanel ? (
            // Pending Invitations view
            <div className="p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 border-l-2 border-primary pl-2">Pending Group Invites</h4>
              {pendingInvites.length === 0 ? (
                <div className="text-center py-10 opacity-30 flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Queue Empty</span>
                </div>
              ) : (
                pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-4 rounded-xl bg-surface-container-high/40 border border-secondary-container/10 flex flex-col gap-3 shadow-md hover:border-primary/20 transition-all">
                    <div>
                      <span className="text-xs font-black text-on-surface block truncate">{invite.group.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 block mt-1">
                        Invited by {invite.group.createdBy.fullName}
                      </span>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleRespondInvitation(invite.id, "ACCEPTED")}
                        className="flex-1 py-1.5 bg-emerald-500 text-on-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">check</span> Accept
                      </button>
                      <button
                        onClick={() => handleRespondInvitation(invite.id, "REJECTED")}
                        className="flex-1 py-1.5 bg-surface-container-highest text-error text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-error/10 active:scale-95 transition-all border border-secondary-container/10 flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">close</span> Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Conversations List
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setReloadHistoryTrigger((prev) => prev + 1);
                }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-secondary-container/5 transition-all group relative cursor-pointer ${
                  activeChatId === chat.id ? "bg-primary/[0.04] shadow-inner" : "hover:bg-surface-container-highest/20"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-2xl border border-secondary-container/20 group-hover:border-primary/40 transition-all overflow-hidden shadow-md">
                    <img
                      src={chat.avatar}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      alt=""
                    />
                  </div>
                  {chat.unread && activeChatId !== chat.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface-container-low shadow-lg animate-pulse"></div>
                  )}
                  {!chat.isGroup && chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-surface-container-low shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="text-xs font-bold text-on-surface tracking-tight truncate leading-none flex items-center gap-1">
                      {chat.isGroup && (
                        <span className="material-symbols-outlined text-[13px] text-primary/70">groups</span>
                      )}
                      {chat.name}
                    </h4>
                    <span className="text-[10px] text-on-surface-variant/40 ml-2 shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      chat.unread && activeChatId !== chat.id ? "text-primary font-semibold" : "text-on-surface-variant/50"
                    }`}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
                {activeChatId === chat.id && (
                  <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary rounded-r-full shadow-[0_0_10px_rgba(208,188,255,0.8)]"></div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Panel: Active Chat Window */}
      {activeChat ? (
        <section className="flex-1 flex flex-col bg-surface-container-high/10 relative min-w-0">
          <header className="flex justify-between items-center px-5 py-4 border-b border-secondary-container/10 bg-surface-container-low/30 backdrop-blur-3xl z-20">
            <div className="flex items-center gap-4">
              {/* Expand Sidebar Button (shown only when sidebar is collapsed) */}
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-9 h-9 rounded-xl bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all shrink-0"
                  title="Open Sidebar"
                >
                  <span className="material-symbols-outlined text-[20px]">left_panel_open</span>
                </button>
              )}
              <div className="w-10 h-10 rounded-xl border border-primary/20 shadow-xl overflow-hidden">
                <img src={activeChat.avatar} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface tracking-tight leading-none mb-1 flex items-center gap-1.5">
                  {activeChat.isGroup && (
                    <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                  )}
                  {activeChat.name}
                </h2>
                {activeChat.isGroup ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    <span className="text-xs text-emerald-500 font-medium">Active</span>
                  </div>
                ) : activeChat.isOnline ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    <span className="text-xs text-emerald-500 font-medium">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/30"></div>
                    <span className="text-xs text-on-surface-variant/50">
                      Offline {activeChat.lastActiveAt ? `· ${new Date(activeChat.lastActiveAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 relative">
              {/* If group, show Invite Member option */}
              {activeChat.isGroup && (
                <button
                  onClick={handleOpenInviteModal}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-xl hover:bg-primary hover:text-on-primary transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  Invite
                </button>
              )}

              {/* View Profile details button (only private chat) */}
              {!activeChat.isGroup && (
                <button
                  onClick={() => navigate(`/profile/${activeChat.id}`)}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">person</span>
                  Profile
                </button>
              )}

              {/* Chat Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowChatSettingsMenu(!showChatSettingsMenu)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    showChatSettingsMenu
                      ? "bg-surface-container-high text-on-surface"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">more_vert</span>
                </button>

                {showChatSettingsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowChatSettingsMenu(false)}
                    />
                    <div className="absolute top-12 right-0 w-48 bg-surface-container-low border border-secondary-container/20 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <button
                        onClick={handleClearChat}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                        Clear Chat
                      </button>

                      {!activeChat.isGroup && (
                        <button
                          onClick={handleBlockUser}
                          className="w-full px-4 py-2 text-left text-xs font-semibold text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">block</span>
                          Block User
                        </button>
                      )}

                      {activeChat.isGroup && (activeChat as any).createdById === user?.id && (
                        <>
                          <div className="h-px bg-secondary-container/10 my-1"></div>
                          <button
                            onClick={() => {
                              setGroupRenameInput(activeChat.name);
                              setShowRenameGroupModal(true);
                              setShowChatSettingsMenu(false);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Rename Group
                          </button>
                          <button
                            onClick={handleDeleteGroup}
                            className="w-full px-4 py-2 text-left text-xs font-semibold text-error hover:bg-error/10 transition-colors flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Delete Group
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 no-scrollbar relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(208,188,255,0.02),transparent)] pointer-events-none"></div>

            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-10">
                <span className="material-symbols-outlined text-[48px] mb-4">forum</span>
                <span className="text-xs font-black uppercase tracking-[0.3em]">Secure Channel Initialized</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isSelf = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col gap-1.5 max-w-[72%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      isSelf ? "items-end self-end ml-auto" : "items-start self-start mr-auto"
                    }`}
                  >
                    {/* Member name in group */}
                    {!isSelf && activeChat.isGroup && (
                      <span className="text-[11px] font-semibold text-primary/80 pl-3 mb-0.5 block">
                        {msg.sender.fullName}
                      </span>
                    )}

                    <div
                      className={`px-4 py-3 rounded-2xl text-sm font-normal shadow-md leading-relaxed relative ${
                        isSelf
                          ? "bg-primary text-on-primary rounded-tr-sm shadow-primary/15"
                          : "bg-surface-container-high border border-secondary-container/10 text-on-surface rounded-tl-sm"
                      }`}
                    >
                      {msg.content}

                      {/* Workout Plan linked card */}
                      {msg.workoutPlan && (
                        <div className="mt-4 flex items-center justify-between gap-6 p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md hover:border-primary/40 transition-all duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                              <span className="material-symbols-outlined text-primary text-[20px]">fitness_center</span>
                            </div>
                            <div>
                              <span className="text-[8px] uppercase font-black tracking-widest text-primary block mb-0.5">
                                Workout Protocol
                              </span>
                              <span className="text-xs font-black text-white truncate max-w-[150px] block">
                                {msg.workoutPlan.title}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(`/workout-builder?planId=${msg.workoutPlanId}`)}
                            className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-on-primary text-[8px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shrink-0 flex items-center gap-1 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span> Launch Builder
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 px-1 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                      <span className="text-[10px] text-on-surface-variant/40">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isSelf && (
                        <span
                          className={`material-symbols-outlined text-[13px] ${
                            msg.isRead ? "text-primary" : "text-on-surface-variant/30"
                          }`}
                        >
                          done_all
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji Picker Popover with outside-click backdrop */}
          {showEmojiPicker && (
            <>
              {/* Transparent backdrop to catch outside clicks */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowEmojiPicker(false)}
              />
              <div className="absolute bottom-40 left-12 p-5 bg-surface-container-low border border-secondary-container/20 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-wrap gap-2 w-72 animate-in fade-in slide-in-from-bottom-8 backdrop-blur-3xl z-50">
                <span className="text-[8px] font-black uppercase tracking-widest text-primary w-full pb-1 border-b border-secondary-container/10 mb-1">Emojis</span>
                {[
                  "🔥","💪","⚡","🥗","🎯","💯","🦾","🏆",
                  "🏋️","🤸","🧘","🚴","🏃","⛹️","🤾","🏊",
                  "💥","🎽","👟","🥊","🏅","🌟","⭐","✅",
                  "📈","🩺","🍎","🥤","💊","😤","😎","🤝",
                  "🙌","👏","💬","📋"
                ].map((e) => (
                  <button
                    key={e}
                    onClick={() => addEmoji(e)}
                    className="text-2xl hover:scale-150 transition-all duration-200 transform-gpu leading-none p-0.5"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Input Area */}
          <div className="px-5 py-4 border-t border-secondary-container/10 bg-surface-container-low/50 backdrop-blur-3xl relative">
            {/* Linked Plan Preview Alert */}
            {selectedPlanId && (
              <div className="absolute top-0 left-5 -translate-y-1/2 px-4 py-1.5 bg-primary text-on-primary rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                <span className="material-symbols-outlined text-[14px]">fitness_center</span>
                {workoutPlans.find((wp) => wp.id === selectedPlanId)?.title}
                <button
                  onClick={() => setSelectedPlanId(null)}
                  className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                >
                  <span className="material-symbols-outlined text-[10px]">close</span>
                </button>
              </div>
            )}

            <div className="flex items-end gap-3 bg-surface-container-high/40 border border-secondary-container/15 rounded-2xl p-3 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-lg relative">
              <div className="flex gap-1 pb-1">
                {/* Link Workout Dropdown Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowPlanDropdown(!showPlanDropdown);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                      showPlanDropdown || selectedPlanId
                        ? "bg-primary text-on-primary"
                        : "text-on-surface-variant hover:text-primary hover:bg-primary/10"
                    }`}
                    title="Link Workout Plan"
                  >
                    <span className="material-symbols-outlined text-[20px]">fitness_center</span>
                  </button>

                  {showPlanDropdown && (
                    <>
                      {/* Transparent backdrop to catch outside clicks */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPlanDropdown(false)}
                      />
                      <div className="absolute bottom-18 left-0 w-64 max-h-60 overflow-y-auto no-scrollbar bg-surface-container-low border border-secondary-container/20 rounded-2xl shadow-2xl p-3 z-50 space-y-1 animate-in fade-in slide-in-from-bottom-4">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary px-3 py-1.5 block border-b border-secondary-container/10">
                          Link Workout Plan
                        </span>
                        {workoutPlans.length === 0 ? (
                          <div className="text-[10px] text-on-surface-variant/40 italic p-3">No plans found.</div>
                        ) : (
                          workoutPlans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setShowPlanDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-black text-on-surface hover:bg-primary/10 rounded-lg transition-colors truncate block"
                            >
                              {plan.title}
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowPlanDropdown(false);
                  }}
                  className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center ${
                    showEmojiPicker ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">sentiment_satisfied</span>
                </button>
              </div>

              <textarea
                className="flex-1 bg-transparent border-none text-on-surface text-sm font-normal py-2 px-3 focus:ring-0 placeholder:text-on-surface-variant/30 min-h-[40px] max-h-[160px] outline-none no-scrollbar leading-relaxed resize-none"
                placeholder="Type a message..."
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              />
              <div className="pb-1">
                <button
                  onClick={handleSendMessage}
                  className="w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:brightness-110 shadow-lg shadow-primary/20 transition-all active:scale-90 group"
                >
                  <span className="material-symbols-outlined text-[20px] fill group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    send
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 flex flex-col bg-surface items-center justify-center text-on-surface-variant/10 relative overflow-hidden min-w-0">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all z-10"
              title="Open Sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">left_panel_open</span>
            </button>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(208,188,255,0.05),transparent)]"></div>
          <div className="relative flex flex-col items-center">
            <div className="w-32 h-32 rounded-[40px] bg-surface-container flex items-center justify-center mb-8 shadow-inner border border-secondary-container/10">
              <span className="material-symbols-outlined text-[64px] opacity-20">sensors</span>
            </div>
            <span className="text-2xl font-black uppercase tracking-[0.5em] opacity-10">Sync Required</span>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
              Initialize frequency for subject interaction
            </p>
          </div>
        </section>
      )}

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowCreateGroupModal(false)}
        >
          <div
            className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[32px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">
                  Create Comm Group
                </h3>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                  New Channel Frequency
                </span>
              </div>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  Group Identifier
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all shadow-inner tracking-wider"
                  placeholder="Enter Group Name..."
                  onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="flex-1 py-4 rounded-xl bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="flex-1 py-4 rounded-xl bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Initialize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME GROUP MODAL */}
      {showRenameGroupModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowRenameGroupModal(false)}
        >
          <div
            className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[32px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">
                  Rename Group
                </h3>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                  Update Channel Identifier
                </span>
              </div>
              <button
                onClick={() => setShowRenameGroupModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-3 border-l-2 border-primary">
                  New Identifier
                </label>
                <input
                  type="text"
                  value={groupRenameInput}
                  onChange={(e) => setGroupRenameInput(e.target.value)}
                  className="w-full bg-surface-container-high/40 border border-secondary-container/10 rounded-xl py-3.5 px-6 text-on-surface text-xs font-black focus:border-primary transition-all shadow-inner tracking-wider"
                  placeholder="Enter New Group Name..."
                  onKeyDown={(e) => e.key === "Enter" && handleRenameGroup()}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowRenameGroupModal(false)}
                className="flex-1 py-4 rounded-xl bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameGroup}
                disabled={!groupRenameInput.trim() || groupRenameInput.trim() === activeChat?.name}
                className="flex-1 py-4 rounded-xl bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all disabled:opacity-20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE USER MODAL */}
      {showInviteModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-surface-container-low/90 backdrop-blur-2xl border border-secondary-container/10 rounded-[32px] p-10 w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none mb-1">
                  Invite Member
                </h3>
                <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                  Select Trainer or Admin
                </span>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-error/10 hover:text-error flex items-center justify-center transition-all border border-secondary-container/10 active:scale-90 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">
                  person_search
                </span>
                <input
                  type="text"
                  className="w-full bg-surface-container-high/40 border border-secondary-container/10 text-xs rounded-xl pl-12 pr-4 py-3 focus:border-primary outline-none transition-all placeholder:text-on-surface-variant/30 font-black shadow-inner uppercase tracking-wider"
                  placeholder="Search candidates..."
                  value={inviteSearch}
                  onChange={(e) => setInviteSearch(e.target.value)}
                />
              </div>

              <div className="max-h-60 overflow-y-auto no-scrollbar space-y-2">
                {candidates
                  .filter(
                    (c) =>
                      c.fullName.toLowerCase().includes(inviteSearch.toLowerCase()) ||
                      c.username.toLowerCase().includes(inviteSearch.toLowerCase())
                  )
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className="p-4 rounded-xl bg-surface-container-high/20 border border-secondary-container/5 flex items-center justify-between hover:bg-surface-container-high/40 hover:border-primary/20 transition-all group"
                    >
                      <div className="min-w-0">
                        <span className="text-xs font-black text-on-surface block truncate">{candidate.fullName}</span>
                        <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                          {candidate.role} • @{candidate.username}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSendInvite(candidate.id)}
                        className="px-4 py-2 bg-primary text-on-primary text-[8px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">send</span> Invite
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex mt-8">
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full py-4 rounded-xl bg-surface-container-high text-on-surface text-[9px] font-black uppercase tracking-widest hover:bg-surface-bright transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel="Acknowledge"
      />
    </div>
  );
};

export default Messages;
