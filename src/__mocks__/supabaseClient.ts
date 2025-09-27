const supabaseMock = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  from: jest.fn(),
  channel: jest.fn(),
  removeChannel: jest.fn(),
};

// Default implementation for 'from'
supabaseMock.from.mockReturnValue({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockResolvedValue({ error: null }),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
});

// Default implementation for 'channel'
supabaseMock.channel.mockReturnValue({
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
});

export const supabase = supabaseMock;