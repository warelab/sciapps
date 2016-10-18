PRAGMA encoding = "UTF-8";

drop table if exists user;
create table user (
	id integer primary key autoincrement,
	name varchar(40) unique,
	consumer_secret varchar(40) not null
);

drop table if exists workflow;
create table workflow (
	id integer primary key autoincrement,
	workflow_id varchar(40) not null
);

drop index if exists workflow_id;
create index workflow_id on workflow(workflow_id);

drop table if exists job;
create table job (
	id integer primary key autoincrement,
	job_id varchar(40) not null,
	agave_id varchar(40),
	app_id varchar(40) not null,
	job_json text,
	workflow_id varchar(40) references workflow(workflow_id)
);

drop index if exists job_id;
create index job_id on job(job_id);

drop index if exists job_agave_id;
create index job_agave_id on job(agave_id);

drop table if exists nextstep;
create table nextstep (
	id integer primary key autoincrement,
	prev varchar(40) references job(job_id),
	next varchar(40) references job(job_id),
	input_name varchar(100) not null,
	status integer default 0
);

--drop index if exists nextstep_input_name;
--create index nextstep_input_name on nextstep(input_name);

drop index if exists nextstep_prev;
create index nextstep_prev on nextstep(prev);

drop index if exists nextstep_next;
create index nextstep_next on nextstep(next);
