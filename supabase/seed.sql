-- Seed data derived from George's existing Excel budget (Budget Detail tab).
-- Amounts are monthly figures with base_frequency = 'monthly' for simplicity;
-- edit base_frequency/base_amount in-app for anything better tracked annually or quarterly.

insert into entities (name, sort_order) values
  ('Primary Home', 0),
  ('Rental Condo', 1),
  ('Personal', 2);

insert into categories (name, flow_type) values
  ('Auto & Transport', 'expense'),
  ('Bills & Utilities', 'expense'),
  ('Fees & Charges', 'expense'),
  ('Home', 'expense'),
  ('Housing', 'expense'),
  ('Insurance', 'expense'),
  ('Memberships', 'expense'),
  ('Subscriptions', 'expense'),
  ('Paycheck', 'income'),
  ('Investment Income', 'income');

-- Expense line items
insert into line_items (name, entity_id, category_id, flow_type, nature, base_amount, base_frequency, payment_method, last_paid_date, notes)
select v.name, e.id, c.id, 'expense', v.nature, v.amount, 'monthly', v.how_paid, v.last_paid::date, v.notes
from (values
  ('American Expres Bonvoy ANNUAL FEE - 2006', 'Personal', 'Fees & Charges', 'fixed', 7.92, null, '2023-03-25', null),
  ('American Express Gold ANNUAL FEE - 1000', 'Personal', 'Fees & Charges', 'fixed', 20.83, null, '2023-05-18', null),
  ('Chase United Explorer MasterCard ANNUAL FEE - 7760', 'Personal', 'Fees & Charges', 'fixed', 7.92, null, '2023-10-01', null),
  ('Chase Sapphire Reserve Visa ANNUAL FEE - 8223', 'Personal', 'Fees & Charges', 'fixed', 82.5, null, '2023-03-01', null),
  ('Chase United Presidential Plus ANNUAL FEE - 5192', 'Personal', 'Fees & Charges', 'fixed', 50, null, '2023-01-01', null),
  ('Netflix', 'Personal', 'Bills & Utilities', 'fixed', 21.31, '9678', null, 'Cancelled DVD; dropped from $29.83'),
  ('Hulu/Disney+/ESPN+', 'Personal', 'Bills & Utilities', 'fixed', 0, null, null, 'Included in VZ Wireless/ Hulu charged $99 8/23; cancelled for 2024'),
  ('Paramount+', 'Personal', 'Bills & Utilities', 'fixed', 8.92, '9678', '2023-06-05', null),
  ('FiOS (TV, Internet, Phone)', 'Personal', 'Bills & Utilities', 'fixed', 255.64, '9678', null, null),
  ('Apple One Premium', 'Personal', 'Subscriptions', 'fixed', 38.32, '9678', null, null),
  ('Notability', 'Personal', 'Subscriptions', 'fixed', 1.67, null, null, null),
  ('Stock Analysis', 'Personal', 'Subscriptions', 'fixed', 6.67, null, null, null),
  ('Eyezon', 'Personal', 'Subscriptions', 'fixed', 8.5, null, null, null),
  ('Nest Aware', 'Personal', 'Subscriptions', 'fixed', 0, '7760', '2023-10-18', 'Going to $150; Cancelled'),
  ('Ring Protect Plus (1st Gen)', 'Personal', 'Subscriptions', 'fixed', 8.89, '7760', '2023-08-23', '604 Winter Ct'),
  ('Ring Protect Plus (1st Gen)', 'Personal', 'Subscriptions', 'fixed', 8.89, '7760', '2025-03-15', '1102 Tahiti Drive'),
  ('Xbox Live', 'Personal', 'Subscriptions', 'fixed', 5.35, '9678', '2023-03-23', null),
  ('Microsoft Office 360 Family', 'Personal', 'Subscriptions', 'fixed', 8.92, '9678', '2023-04-17', null),
  ('Quicken', 'Personal', 'Subscriptions', 'fixed', 0, '7760', '2023-07-22', 'Cancelled'),
  ('Dashlane', 'Personal', 'Subscriptions', 'fixed', 8.03, '7760', '2023-11-02', null),
  ('Cellar Tracker+', 'Personal', 'Subscriptions', 'fixed', 3.33, null, '2023-12-25', null),
  ('Simply Wise', 'Personal', 'Subscriptions', 'fixed', 1.78, null, '2023-01-03', null),
  ('Bookmark Ninja', 'Personal', 'Subscriptions', 'fixed', 1.99, null, '2023-11-08', null),
  ('TripIt Pro', 'Personal', 'Subscriptions', 'fixed', 4.08, '7760', '2023-07-24', null),
  ('Experian - George', 'Personal', 'Subscriptions', 'fixed', 21.31, '9678', null, null),
  ('Amazon Prime', 'Personal', 'Subscriptions', 'fixed', 12.39, '7760', '2023-08-20', null),
  ('Amazon Photos', 'Personal', 'Subscriptions', 'fixed', 1.78, '7760', '2023-12-31', null),
  ('Norton', 'Personal', 'Subscriptions', 'fixed', 12.5, '9310', null, null),
  ('Yahoo Mail+', 'Personal', 'Subscriptions', 'fixed', 3.12, '8223', '2023-01-09', null),
  ('Google One', 'Personal', 'Subscriptions', 'fixed', 1.67, '9678', '2023-12-05', null),
  ('Snowball', 'Personal', 'Subscriptions', 'fixed', 0, null, null, null),
  ('Portfolio Pilot', 'Personal', 'Subscriptions', 'fixed', 20, null, null, null),
  ('You Tube Premium', 'Personal', 'Subscriptions', 'fixed', 11.67, null, null, null),
  ('Chat GPT', 'Personal', 'Subscriptions', 'fixed', 20, null, null, null),
  ('Gemini - Google AI Pro', 'Personal', 'Subscriptions', 'fixed', 8.33, null, null, null),
  ('Yahoo Finance', 'Personal', 'Subscriptions', 'fixed', 0, null, null, 'Bronze'),
  ('Crunch (George)', 'Personal', 'Memberships', 'fixed', 24.51, '9678', null, null),
  ('Crunch (Tricia)', 'Personal', 'Memberships', 'fixed', 24.51, '9678', null, null),
  ('Clear', 'Personal', 'Memberships', 'fixed', 15, '7760', null, null),
  ('Sam''s Club', 'Personal', 'Memberships', 'fixed', 8.88, 'Discover', '2023-08-23', null),
  ('Costco', 'Personal', 'Memberships', 'fixed', 10.66, '8223', '2023-12-18', null),
  ('EyezOn', 'Primary Home', 'Home', 'fixed', 8.5, null, '2023-03-31', null),
  ('Home Insurance', 'Primary Home', 'Home', 'fixed', 216, null, '2023-12-25', null),
  ('Umbrella Insurance', 'Primary Home', 'Home', 'fixed', 75.92, null, '2023-05-25', null),
  ('RE Taxes - 604 Winter Court', 'Primary Home', 'Home', 'fixed', 1904.77, null, null, null),
  ('Lawn Buddy', 'Primary Home', 'Home', 'fixed', 62.5, '1000', '2023-11-19', null),
  ('Mowing - Rena Dawes', 'Primary Home', 'Home', 'fixed', 100, null, null, null),
  ('Water - Freehold', 'Primary Home', 'Bills & Utilities', 'flexible', 100, 'Debit', '2023-03-15', null),
  ('NJNG', 'Primary Home', 'Bills & Utilities', 'flexible', 533, 'Debit', null, null),
  ('First Energy', 'Primary Home', 'Bills & Utilities', 'flexible', 533, '7760', null, null),
  ('Atlas Septic (Every 2 years)', 'Primary Home', 'Bills & Utilities', 'fixed', 16.67, 'Check', null, null),
  ('VZ Wireless', 'Primary Home', 'Bills & Utilities', 'fixed', 434.36, '9678', null, null),
  ('EZ Pass', 'Primary Home', 'Auto & Transport', 'fixed', 130, '9678', null, null),
  ('NJM Auto', 'Primary Home', 'Auto & Transport', 'fixed', 653, '9678', null, null),
  ('AAA', 'Primary Home', 'Auto & Transport', 'fixed', 22.58, null, '2023-09-01', null),
  ('Starbucks', 'Primary Home', 'Auto & Transport', 'flexible', 100, '5192', null, null),
  ('2019 Mercedes GL 450', 'Primary Home', 'Auto & Transport', 'fixed', 612.89, null, null, null),
  ('2021 Ford Explorer ST', 'Primary Home', 'Auto & Transport', 'fixed', 0, null, null, null),
  ('Life - George', 'Primary Home', 'Insurance', 'fixed', 0, null, null, null),
  ('Life - Tricia', 'Primary Home', 'Insurance', 'fixed', 0, null, null, null),
  ('Disability - George (First UNUM)', 'Primary Home', 'Insurance', 'fixed', 34.05, null, null, null),
  ('Chase Mortgage', 'Rental Condo', 'Housing', 'fixed', 3259, null, '2023-03-31', null),
  ('Home Insurance', 'Rental Condo', 'Housing', 'fixed', 116.85, null, '2023-12-25', null),
  ('Flood Insurance', 'Rental Condo', 'Housing', 'fixed', 61.67, null, '2023-05-25', null),
  ('RE Taxes', 'Rental Condo', 'Housing', 'fixed', 1299.94, null, null, null),
  ('Xfinity', 'Rental Condo', 'Housing', 'flexible', 75, null, '2023-11-19', null),
  ('NJNG', 'Rental Condo', 'Housing', 'flexible', 138, null, null, null),
  ('JCP&L', 'Rental Condo', 'Housing', 'flexible', 123, null, null, null),
  ('Other', 'Rental Condo', 'Housing', 'fixed', 0, null, null, null),
  ('Other', 'Rental Condo', 'Housing', 'fixed', 0, null, null, null)
) as v(name, entity_name, category_name, nature, amount, how_paid, last_paid, notes)
join entities e on e.name = v.entity_name
join categories c on c.name = v.category_name and c.flow_type = 'expense';

-- Income line items
insert into line_items (name, entity_id, category_id, flow_type, nature, base_amount, base_frequency, payment_method, notes)
select v.name, null, c.id, 'income', 'fixed', v.amount, 'monthly', v.how_paid, v.notes
from (values
  ('Net Pay', 11000, null, 'Bi-weekly paycheck, shown as monthly equivalent'),
  ('Schwab Interest', 1400, null, null),
  ('JPM Interest', 1000, null, null)
) as v(name, amount, how_paid, notes)
join categories c on c.name = 'Paycheck' and c.flow_type = 'income' and v.name = 'Net Pay'
  or (c.name = 'Investment Income' and c.flow_type = 'income' and v.name != 'Net Pay');
