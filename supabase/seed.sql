
-- Instructions for the User:
-- 1. Run these SQL commands in your Supabase SQL Editor to seed initial data and roles.
-- 2. Make sure you have created users in the Authentication tab first.
-- 3. Replace 'USER_ID_HERE' with the actual UUID from the auth.users table.

-- Insert Profiles for the users you created in Auth
-- Example for Manager
insert into public.profiles (id, role) 
values ('325649cc-2336-411c-ac77-76b1b64de522', 'Manager');

-- Example for Receptionist
insert into public.profiles (id, role) 
values ('815a4765-4d8c-49c8-a1e4-df1fc26a04e4', 'Receptionist');

-- Seed Sample Members
insert into public.members (full_name, category, duration, start_date, expiry_date, status)
values 
('Alice Umutoni', 'Student', 'Monthly', current_date, current_date + interval '1 month', 'Active'),
('Bob Smith', 'Normal Membership', 'Monthly', current_date - interval '25 days', current_date + interval '5 days', 'Expiring Soon'),
('Charlie Kim', 'Hotel Resident', 'Weekly', current_date, current_date + interval '7 days', 'Active'),
('David Murenzi', 'Normal Membership', 'Monthly', current_date - interval '40 days', current_date - interval '10 days', 'Expired');

-- Seed Sample Payments
insert into public.payments (member_id, amount, payment_method)
select id, 30000, 'Mobile Money' from public.members where full_name = 'Alice Umutoni';

insert into public.payments (member_id, amount, payment_method)
select id, 5000, 'Cash' from public.members where full_name = 'Bob Smith';

-- Seed Sample Attendance
insert into public.attendance (member_id)
select id from public.members where full_name = 'Alice Umutoni';
