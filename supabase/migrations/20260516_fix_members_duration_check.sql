alter table public.members
drop constraint if exists members_duration_check;

alter table public.members
add constraint members_duration_check
check (
    duration in (
        'Weekly',
        'Monthly',
        '3 Months',
        '6 Months',
        'Annual',
        'Daily'
    )
    or duration ~ '^[0-9]+ Months$'
    or duration ~ '^[0-9]+ Day$'
    or duration ~ '^[0-9]+ Days$'
);
