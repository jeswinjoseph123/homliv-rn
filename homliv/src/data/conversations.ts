import { Conversation } from '../types'

const now = new Date('2026-04-26T12:00:00Z')
const mins = (n: number) => new Date(now.getTime() - n * 60 * 1000)
const hrs = (n: number) => new Date(now.getTime() - n * 3600 * 1000)
const days = (n: number) => new Date(now.getTime() - n * 86400 * 1000)

export const mockConversations: Conversation[] = [
  // 1. Regular text conversation about l1
  {
    id: 'c1',
    listingId: 'l1',
    participantIds: ['u3', 'u2'],
    messages: [
      { id: 'm1', conversationId: 'c1', senderId: 'u3', type: 'text', text: 'Hi! Is the room in Ranelagh still available?', createdAt: days(3) },
      { id: 'm2', conversationId: 'c1', senderId: 'u2', type: 'text', text: 'Yes it is! Available from this weekend. Are you working professionally in Dublin?', createdAt: days(3), readAt: days(3) },
      { id: 'm3', conversationId: 'c1', senderId: 'u3', type: 'text', text: 'I\'m a software engineer in Google D2. Would love to view it this week if possible.', createdAt: days(3) },
      { id: 'm4', conversationId: 'c1', senderId: 'u2', type: 'text', text: 'Great, that works perfectly. I\'m available Thursday evening or Saturday morning.', createdAt: days(2), readAt: days(2) },
      { id: 'm5', conversationId: 'c1', senderId: 'u3', type: 'text', text: 'Thursday at 6pm works for me!', createdAt: mins(45) },
    ],
    createdAt: days(3),
    updatedAt: mins(45),
  },
  // 2. Viewing request + confirmation
  {
    id: 'c2',
    listingId: 'l4',
    participantIds: ['u4', 'u1'],
    messages: [
      { id: 'm6', conversationId: 'c2', senderId: 'u4', type: 'text', text: 'Hi Priya, I\'m very interested in the Grand Canal Dock apartment. Is it still available?', createdAt: days(5) },
      { id: 'm7', conversationId: 'c2', senderId: 'u1', type: 'text', text: 'Yes! It\'s available from May 10th. Would you like to arrange a viewing?', createdAt: days(5), readAt: days(5) },
      {
        id: 'm8',
        conversationId: 'c2',
        senderId: 'u4',
        type: 'viewing_request',
        viewingData: {
          slots: [
            new Date('2026-04-29T10:00:00Z'),
            new Date('2026-04-30T14:00:00Z'),
            new Date('2026-05-01T18:00:00Z'),
          ],
          note: 'Happy to come at any of these times. Parking available nearby?',
        },
        createdAt: days(4),
      },
      {
        id: 'm9',
        conversationId: 'c2',
        senderId: 'u1',
        type: 'viewing_confirmed',
        viewingData: {
          slots: [
            new Date('2026-04-29T10:00:00Z'),
            new Date('2026-04-30T14:00:00Z'),
            new Date('2026-05-01T18:00:00Z'),
          ],
          confirmedSlot: new Date('2026-04-30T14:00:00Z'),
          note: 'Confirmed for Wed 30 April at 2pm. Visitor parking is available in the underground car park.',
        },
        createdAt: days(4),
        readAt: days(4),
      },
      { id: 'm10', conversationId: 'c2', senderId: 'u4', type: 'text', text: 'Perfect, see you Wednesday!', createdAt: hrs(12) },
    ],
    createdAt: days(5),
    updatedAt: hrs(12),
  },
  // 3. Maintenance request
  {
    id: 'c3',
    listingId: 'l5',
    participantIds: ['u3', 'u6'],
    messages: [
      { id: 'm11', conversationId: 'c3', senderId: 'u3', type: 'text', text: 'Hi Sean, hope all is well.', createdAt: days(10) },
      { id: 'm12', conversationId: 'c3', senderId: 'u6', type: 'text', text: 'All good Aoife, what\'s up?', createdAt: days(10), readAt: days(10) },
      {
        id: 'm13',
        conversationId: 'c3',
        senderId: 'u3',
        type: 'maintenance',
        maintenanceData: {
          category: 'Heating',
          priority: 'high',
          description: 'The boiler stopped working this morning. No hot water or heating. Temperature is 8°C inside. Can this be fixed urgently?',
          photos: [],
          status: 'in_progress',
        },
        createdAt: days(2),
      },
      { id: 'm14', conversationId: 'c3', senderId: 'u6', type: 'text', text: 'On it! I\'ll have a plumber there by 2pm today. Sorry about this.', createdAt: days(2), readAt: days(2) },
      { id: 'm15', conversationId: 'c3', senderId: 'u3', type: 'text', text: 'Thank you! That\'s a relief.', createdAt: hrs(48) },
    ],
    createdAt: days(10),
    updatedAt: hrs(48),
  },
  // 4. Owner-occupier room enquiry
  {
    id: 'c4',
    listingId: 'l2',
    participantIds: ['u8', 'u2'],
    messages: [
      { id: 'm16', conversationId: 'c4', senderId: 'u8', type: 'text', text: 'Hello, I\'m a final year student at Maynooth University. Is the room still available for May?', createdAt: hrs(6) },
      { id: 'm17', conversationId: 'c4', senderId: 'u2', type: 'text', text: 'Hi Alex! Yes, available from May 3rd. We\'re a vegetarian household — is that okay?', createdAt: hrs(5), readAt: hrs(5) },
      { id: 'm18', conversationId: 'c4', senderId: 'u8', type: 'text', text: 'Totally fine! I don\'t eat meat either. What\'s included in the bills?', createdAt: hrs(4) },
    ],
    createdAt: hrs(6),
    updatedAt: hrs(4),
  },
  // 5. Housemate enquiry
  {
    id: 'c5',
    listingId: 'l7',
    participantIds: ['u5', 'u3'],
    messages: [
      { id: 'm19', conversationId: 'c5', senderId: 'u5', type: 'text', text: 'Hi! I saw your listing for the Galway house. I\'m a nurse starting in Galway University Hospital in May. Would the room suit?', createdAt: days(1) },
      { id: 'm20', conversationId: 'c5', senderId: 'u3', type: 'text', text: 'That sounds perfect! We\'d love a professional. The room is still available. Can you do a call this week?', createdAt: hrs(20), readAt: hrs(20) },
      { id: 'm21', conversationId: 'c5', senderId: 'u5', type: 'text', text: 'Yes, tomorrow evening works. 7pm?', createdAt: hrs(3) },
      { id: 'm22', conversationId: 'c5', senderId: 'u3', type: 'text', text: '7pm works great. I\'ll send you a WhatsApp closer to the time with a link.', createdAt: hrs(2), readAt: hrs(2) },
    ],
    createdAt: days(1),
    updatedAt: hrs(2),
  },
]
