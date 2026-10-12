select cron.unschedule(1);

drop function if exists public.archive_missed_welcome_coffee();

revoke execute on function public.mark_coffee_attended(uuid, uuid, uuid) from public;

select jobid, schedule, command, active from cron.job;
