import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prisma } from '@fitsync/database';

@Injectable()
export class MessageService {
  // User/Trainer: send a message to another user or group
  async sendMessage(
    senderId: string,
    payload: { receiverId?: string; groupId?: string; content?: string; workoutPlanId?: string },
  ) {
    if (!payload.content) {
      throw new BadRequestException('content is required');
    }

    if (!payload.receiverId && !payload.groupId) {
      throw new BadRequestException('Either receiverId or groupId must be provided');
    }

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    if (!sender) throw new NotFoundException('Sender not found');

    if (payload.groupId) {
      const membership = await prisma.chatGroupMember.findUnique({
        where: {
          groupId_userId: {
            groupId: payload.groupId,
            userId: senderId,
          },
        },
      });
      if (!membership || membership.status !== 'ACCEPTED') {
        throw new BadRequestException('You are not an authorized member of this group');
      }
    } else if (payload.receiverId) {
      const receiver = await prisma.user.findUnique({ where: { id: payload.receiverId } });
      if (!receiver) throw new NotFoundException('Receiver not found');
      if (senderId === payload.receiverId) {
        throw new BadRequestException('Cannot send a message to yourself');
      }

      // Verify connection exists and is ACCEPTED
      const connection = await prisma.connection.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { requesterId: senderId, addresseeId: payload.receiverId },
            { requesterId: payload.receiverId, addresseeId: senderId },
          ],
        },
      });
      if (!connection) {
        throw new BadRequestException('You must be connected with this user to send a message');
      }

      // Check blocks
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: senderId, blockedId: payload.receiverId },
            { blockerId: payload.receiverId, blockedId: senderId },
          ]
        }
      });
      if (block) {
        throw new BadRequestException('Cannot send message. A block exists between you and this user.');
      }
    }

    return prisma.message.create({
      data: {
        senderId,
        receiverId: payload.receiverId || null,
        groupId: payload.groupId || null,
        content: payload.content,
        workoutPlanId: payload.workoutPlanId || null,
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        group: { select: { id: true, name: true } },
        workoutPlan: { select: { id: true, title: true } },
      },
    });
  }

  // Get unified list of active private chats and accepted group channels
  async getRecentConversations(userId: string) {
    const memberships = await prisma.chatGroupMember.findMany({
      where: { userId, status: 'ACCEPTED' },
      select: { groupId: true },
    });
    const groupIds = memberships.map(m => m.groupId);

    const [messages, chatClears] = await Promise.all([
      prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
            { groupId: { in: groupIds } },
          ],
        },
        include: {
          sender: { select: { id: true, fullName: true, role: true, isOnline: true, lastActiveAt: true } },
          receiver: { select: { id: true, fullName: true, role: true, isOnline: true, lastActiveAt: true } },
          group: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.chatClear.findMany({
        where: { userId }
      })
    ]);

    const clearMap = new Map<string, Date>();
    chatClears.forEach(c => {
      if (c.groupId) clearMap.set(c.groupId, c.clearedAt);
      if (c.otherUserId) clearMap.set(c.otherUserId, c.clearedAt);
    });

    const conversationsMap = new Map<string, any>();

    const [activeGroups, activeConnections] = await Promise.all([
      prisma.chatGroup.findMany({
        where: { id: { in: groupIds } },
      }),
      prisma.connection.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [
            { requesterId: userId },
            { addresseeId: userId },
          ]
        },
        include: {
          requester: { select: { id: true, fullName: true, isOnline: true, lastActiveAt: true } },
          addressee: { select: { id: true, fullName: true, isOnline: true, lastActiveAt: true } }
        }
      })
    ]);

    // Seed groups
    activeGroups.forEach(g => {
      conversationsMap.set(g.id, {
        id: g.id,
        name: g.name,
        avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${g.id}`,
        isGroup: true,
        createdById: g.createdById,
        lastMessage: 'No messages yet',
        lastMessageTime: '',
        unread: false,
        unreadCount: 0,
        rawTime: g.createdAt,
      });
    });

    // Seed direct connections
    activeConnections.forEach(c => {
      const otherUser = c.requesterId === userId ? c.addressee : c.requester;
      conversationsMap.set(otherUser.id, {
        id: otherUser.id,
        name: otherUser.fullName,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${otherUser.id}`,
        isGroup: false,
        lastMessage: 'No messages yet',
        lastMessageTime: '',
        unread: false,
        unreadCount: 0,
        rawTime: c.updatedAt,
        isOnline: otherUser.isOnline,
        lastActiveAt: otherUser.lastActiveAt,
      });
    });

    messages.forEach(msg => {
      const isGroup = !!msg.groupId;
      const key = isGroup ? msg.groupId! : (msg.senderId === userId ? msg.receiverId! : msg.senderId);

      if (!key) return;

      const clearedAt = clearMap.get(key);
      if (clearedAt && new Date(msg.createdAt) <= new Date(clearedAt)) {
        return; // Ignore this message
      }

      const existing = conversationsMap.get(key);
      const isRead = msg.isRead || msg.senderId === userId;

      if (!existing || new Date(msg.createdAt) > new Date(existing.rawTime)) {
        const name = isGroup
          ? msg.group?.name || 'Group Chat'
          : (msg.senderId === userId ? msg.receiver?.fullName : msg.sender?.fullName) || 'User';

        const lastMessage = msg.content;
        const lastMessageTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const prevUnreadCount = existing ? existing.unreadCount : 0;
        const newUnreadCount = prevUnreadCount + (isRead ? 0 : 1);

        const otherParticipant = isGroup ? null : (msg.senderId === userId ? msg.receiver : msg.sender);

        conversationsMap.set(key, {
          id: key,
          name,
          avatar: isGroup
            ? `https://api.dicebear.com/7.x/identicon/svg?seed=${key}`
            : `https://api.dicebear.com/7.x/adventurer/svg?seed=${key}`,
          isGroup,
          createdById: isGroup ? activeGroups.find(g => g.id === key)?.createdById : undefined,
          lastMessage,
          lastMessageTime,
          unread: newUnreadCount > 0,
          unreadCount: newUnreadCount,
          rawTime: msg.createdAt,
          isOnline: otherParticipant ? otherParticipant.isOnline : false,
          lastActiveAt: otherParticipant ? otherParticipant.lastActiveAt : null,
        });
      } else {
        if (!isRead) {
          existing.unreadCount += 1;
          existing.unread = true;
        }
      }
    });

    return Array.from(conversationsMap.values()).sort((a, b) => new Date(b.rawTime).getTime() - new Date(a.rawTime).getTime());
  }

  // Create a new chat group
  async createGroup(name: string, creatorId: string) {
    if (!name.trim()) {
      throw new BadRequestException('Group name cannot be empty');
    }

    const creator = await prisma.user.findUnique({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    const group = await prisma.chatGroup.create({
      data: {
        name: name.trim(),
        createdById: creatorId,
      },
    });

    await prisma.chatGroupMember.create({
      data: {
        groupId: group.id,
        userId: creatorId,
        status: 'ACCEPTED',
        joinedAt: new Date(),
      },
    });

    return group;
  }

  // Invite user to group
  async inviteToGroup(groupId: string, inviteeId: string, inviterId: string) {
    const [group, invitee, inviter] = await Promise.all([
      prisma.chatGroup.findUnique({ where: { id: groupId } }),
      prisma.user.findUnique({ where: { id: inviteeId } }),
      prisma.user.findUnique({ where: { id: inviterId } }),
    ]);

    if (!group) throw new NotFoundException('Group not found');
    if (!invitee) throw new NotFoundException('Invitee not found');
    if (!inviter) throw new NotFoundException('Inviter not found');

    const membership = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: inviterId } },
    });
    if (!membership || membership.status !== 'ACCEPTED') {
      throw new BadRequestException('You are not authorized to invite members to this group');
    }

    const existingMember = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: inviteeId } },
    });

    if (existingMember) {
      if (existingMember.status === 'ACCEPTED') {
        throw new BadRequestException('User is already a member of this group');
      }
      return prisma.chatGroupMember.update({
        where: { id: existingMember.id },
        data: { status: 'PENDING' },
      });
    }

    return prisma.chatGroupMember.create({
      data: {
        groupId,
        userId: inviteeId,
        status: 'PENDING',
      },
    });
  }

  // Get pending invitations for a user
  async getPendingInvitations(userId: string) {
    return prisma.chatGroupMember.findMany({
      where: { userId, status: 'PENDING' },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            createdBy: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Accept or reject an invitation
  async respondToInvitation(membershipId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') {
    const member = await prisma.chatGroupMember.findUnique({
      where: { id: membershipId },
    });

    if (!member) throw new NotFoundException('Invitation not found');
    if (member.userId !== userId) {
      throw new BadRequestException('You are not authorized to respond to this invitation');
    }

    return prisma.chatGroupMember.update({
      where: { id: membershipId },
      data: {
        status,
        joinedAt: status === 'ACCEPTED' ? new Date() : null,
      },
      include: {
        group: true,
      },
    });
  }

  // Get candidates for chat (only users with active accepted connections with the current user)
  async getChatCandidates(userId: string) {
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
            isOnline: true,
            lastActiveAt: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
            isOnline: true,
            lastActiveAt: true,
          },
        },
      },
    });

    return connections.map(conn => {
      const otherUser = conn.requesterId === userId ? conn.addressee : conn.requester;
      return {
        id: otherUser.id,
        fullName: otherUser.fullName,
        email: otherUser.email,
        username: otherUser.username,
        role: otherUser.role,
        isOnline: otherUser.isOnline,
        lastActiveAt: otherUser.lastActiveAt,
      };
    });
  }

  // Get conversation history for a group
  async getGroupConversation(groupId: string, userId: string) {
    const membership = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!membership || membership.status !== 'ACCEPTED') {
      throw new BadRequestException('You are not authorized to view this group history');
    }

    const clearRecord = await prisma.chatClear.findUnique({
      where: { userId_groupId: { userId, groupId } }
    });

    return prisma.message.findMany({
      where: { 
        groupId,
        ...(clearRecord ? { createdAt: { gt: clearRecord.clearedAt } } : {})
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        workoutPlan: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // User: get full conversation thread with another specific user
  async getConversation(userId: string, otherUserId: string) {
    const clearRecord = await prisma.chatClear.findUnique({
      where: { userId_otherUserId: { userId, otherUserId } }
    });

    return prisma.message.findMany({
      where: {
        groupId: null,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        ...(clearRecord ? { createdAt: { gt: clearRecord.clearedAt } } : {})
      },
      include: {
        sender: { select: { id: true, fullName: true, role: true } },
        receiver: { select: { id: true, fullName: true, role: true } },
        workoutPlan: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // User: mark a received message as read
  async markAsRead(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.receiverId !== userId) {
      throw new BadRequestException(
        'You can only mark your own received messages as read',
      );
    }
    return prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  // User: mark all inbox messages from a sender as read
  async markAllAsRead(receiverId: string, senderId: string) {
    await prisma.message.updateMany({
      where: { receiverId, senderId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All messages marked as read', success: true };
  }

  // User: count unread messages
  async getUnreadCount(userId: string) {
    const count = await prisma.message.count({
      where: { receiverId: userId, isRead: false },
    });
    return { unreadCount: count };
  }

  // User: get their inbox (all received messages)
  async getInbox(userId: string) {
    return prisma.message.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // User: get their sent message history
  async getSentMessages(userId: string) {
    return prisma.message.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // User/Admin: delete a specific message
  async deleteMessage(messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    await prisma.message.delete({ where: { id: messageId } });
    return { message: 'Message deleted', success: true };
  }

  // Send connection request
  async sendConnectionRequest(requesterId: string, addresseeId: string) {
    if (requesterId === addresseeId) {
      throw new BadRequestException('Cannot connect with yourself');
    }

    const [requester, addressee] = await Promise.all([
      prisma.user.findUnique({ where: { id: requesterId } }),
      prisma.user.findUnique({ where: { id: addresseeId } }),
    ]);

    if (!requester) throw new NotFoundException('Requester not found');
    if (!addressee) throw new NotFoundException('Addressee not found');

    // Check if there is an existing connection
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new BadRequestException('You are already connected with this user');
      }
      if (existing.status === 'PENDING') {
        if (existing.requesterId === requesterId) {
          throw new BadRequestException('Connection request already pending');
        } else {
          // If the other person had already requested us, auto-accept it!
          return prisma.connection.update({
            where: { id: existing.id },
            data: { status: 'ACCEPTED' },
          });
        }
      }
      if (existing.status === 'REJECTED') {
        // Reset to pending and set the requester to current user
        return prisma.connection.update({
          where: { id: existing.id },
          data: {
            requesterId,
            addresseeId,
            status: 'PENDING',
          },
        });
      }
    }

    return prisma.connection.create({
      data: {
        requesterId,
        addresseeId,
        status: 'PENDING',
      },
    });
  }

  // Accept or decline connection request
  async respondToConnectionRequest(connectionId: string, userId: string, status: 'ACCEPTED' | 'REJECTED') {
    const conn = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!conn) throw new NotFoundException('Connection request not found');
    if (conn.addresseeId !== userId) {
      throw new BadRequestException('You are not authorized to respond to this connection request');
    }

    if (status === 'REJECTED') {
      // Delete connection to allow re-requesting later
      await prisma.connection.delete({ where: { id: connectionId } });
      return { success: true, message: 'Connection request declined' };
    }

    return prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'ACCEPTED' },
    });
  }

  // Get all pending connection requests received by user
  async getPendingConnections(userId: string) {
    return prisma.connection.findMany({
      where: { addresseeId: userId, status: 'PENDING' },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get active accepted connections for a user
  async getConnections(userId: string) {
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: userId },
          { addresseeId: userId },
        ],
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
            isOnline: true,
            lastActiveAt: true,
          },
        },
        addressee: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            role: true,
            isOnline: true,
            lastActiveAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return connections.map(c => {
      const otherUser = c.requesterId === userId ? c.addressee : c.requester;
      return {
        connectionId: c.id,
        otherUser,
      };
    });
  }

  // Discover other trainers/admins and their connection relationship with current user
  async getDiscoveryUsers(userId: string, search?: string) {
    const blocks = await prisma.block.findMany({
      where: {
        OR: [{ blockerId: userId }, { blockedId: userId }]
      }
    });
    const blockedUserIds = blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);

    const whereClause: any = {
      id: { 
        not: userId,
        notIn: blockedUserIds
      },
      role: { in: ['TRAINER', 'ADMIN'] },
    };

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, sentReqs, receivedReqs] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          email: true,
          username: true,
          role: true,
          isOnline: true,
          lastActiveAt: true,
        },
        orderBy: { fullName: 'asc' },
      }),
      prisma.connection.findMany({
        where: { requesterId: userId },
      }),
      prisma.connection.findMany({
        where: { addresseeId: userId },
      }),
    ]);

    const sentMap = new Map(sentReqs.map(r => [r.addresseeId, r]));
    const receivedMap = new Map(receivedReqs.map(r => [r.requesterId, r]));

    return users.map(u => {
      let connectionStatus: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED' = 'NONE';
      let connectionId: string | undefined;

      const sent = sentMap.get(u.id);
      const received = receivedMap.get(u.id);

      if (sent) {
        connectionId = sent.id;
        connectionStatus = sent.status === 'ACCEPTED' ? 'CONNECTED' : 'PENDING_SENT';
      } else if (received) {
        connectionId = received.id;
        connectionStatus = received.status === 'ACCEPTED' ? 'CONNECTED' : 'PENDING_RECEIVED';
      }

      return {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        username: u.username,
        role: u.role,
        isOnline: u.isOnline,
        lastActiveAt: u.lastActiveAt,
        connectionStatus,
        connectionId,
      };
    });
  }

  // ================= GROUP MANAGEMENT =================

  async renameGroup(groupId: string, name: string, requesterId: string) {
    if (!name.trim()) throw new BadRequestException('Group name cannot be empty');
    
    const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    
    if (group.createdById !== requesterId) {
      throw new BadRequestException('Only the group creator can rename it');
    }
    
    return prisma.chatGroup.update({
      where: { id: groupId },
      data: { name: name.trim() },
    });
  }

  async deleteGroup(groupId: string, requesterId: string) {
    const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    
    if (group.createdById !== requesterId) {
      throw new BadRequestException('Only the group creator can delete it');
    }
    
    await prisma.chatGroup.delete({ where: { id: groupId } });
    return { success: true, message: 'Group deleted' };
  }

  async removeMemberFromGroup(groupId: string, memberId: string, requesterId: string) {
    const group = await prisma.chatGroup.findUnique({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group not found');
    
    if (group.createdById !== requesterId) {
      throw new BadRequestException('Only the group creator can remove members');
    }
    if (memberId === requesterId) {
      throw new BadRequestException('Creator cannot remove themselves');
    }
    
    const membership = await prisma.chatGroupMember.findUnique({
      where: { groupId_userId: { groupId, userId: memberId } }
    });
    
    if (!membership) throw new NotFoundException('User is not in this group');
    
    await prisma.chatGroupMember.delete({ where: { id: membership.id } });
    return { success: true, message: 'Member removed' };
  }

  // ================= CHAT CLEARING (SOFT DELETE) =================

  async clearChat(userId: string, otherUserId?: string, groupId?: string) {
    if (otherUserId) {
      // Find or create clear record for direct chat
      const existing = await prisma.chatClear.findUnique({
        where: { userId_otherUserId: { userId, otherUserId } }
      });
      if (existing) {
        return prisma.chatClear.update({
          where: { id: existing.id },
          data: { clearedAt: new Date() }
        });
      }
      return prisma.chatClear.create({
        data: { userId, otherUserId, clearedAt: new Date() }
      });
    } else if (groupId) {
      // Find or create clear record for group chat
      const existing = await prisma.chatClear.findUnique({
        where: { userId_groupId: { userId, groupId } }
      });
      if (existing) {
        return prisma.chatClear.update({
          where: { id: existing.id },
          data: { clearedAt: new Date() }
        });
      }
      return prisma.chatClear.create({
        data: { userId, groupId, clearedAt: new Date() }
      });
    }
  }

  // ================= BLOCKING =================

  async blockUser(blockerId: string, blockedId: string) {
    if (blockerId === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }
    
    const blockedUser = await prisma.user.findUnique({ where: { id: blockedId } });
    if (!blockedUser) throw new NotFoundException('User not found');
    
    if (blockedUser.role === 'ADMIN') {
      throw new BadRequestException('Admins cannot be blocked');
    }
    
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } }
    });
    
    if (existing) throw new BadRequestException('User is already blocked');
    
    return prisma.block.create({
      data: { blockerId, blockedId }
    });
  }

  async unblockUser(blockerId: string, blockedId: string) {
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } }
    });
    
    if (!existing) throw new BadRequestException('User is not blocked');
    
    await prisma.block.delete({ where: { id: existing.id } });
    return { success: true, message: 'User unblocked' };
  }
}
