PRAGMA encoding = "UTF-8";

drop table if exists workflow;
create table workflow (
	id integer primary key autoincrement
);

drop table if exists job;
create table job (
	id integer primary key autoincrement,
	job_id varchar(40) not null,
	agave_id varchar(40),
	app_id varchar(40) not null,
	job_json text
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

insert into job (job_id, agave_id, app_id) values ('4853251334283718170-242ac113-0001-007', '4853251334283718170-242ac113-0001-007', 'GLM-TASSEL-5.1.23');
insert into job (job_id, agave_id, app_id) values ('688707076778028570-242ac113-0001-007', '688707076778028570-242ac113-0001-007', 'AdjustPvalue-0.0.1');
insert into job (job_id, agave_id, app_id) values ('4577730763006218726-242ac113-0001-007', '4577730763006218726-242ac113-0001-007', 'XYPlot-0.0.2');
insert into job (job_id, agave_id, app_id) values ('8186737218570424806-242ac113-0001-007', '8186737218570424806-242ac113-0001-007', 'XYPlot-0.0.2');
insert into job (job_id, agave_id, app_id) values ('4402175727251886566-242ac115-0001-007', '4402175727251886566-242ac115-0001-007', 'queryGramene-0.0.1');
insert into job (job_id, agave_id, app_id) values ('3469005640213074406-242ac113-0001-007', '3469005640213074406-242ac113-0001-007', 'MAKER-0.0.1');
