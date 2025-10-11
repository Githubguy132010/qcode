CREATE TABLE coupons (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    store TEXT,
    expiry_date TIMESTAMPTZ,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);