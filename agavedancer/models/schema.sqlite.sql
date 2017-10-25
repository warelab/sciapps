PRAGMA encoding = "UTF-8";

drop table if exists agave_user;
create table agave_user (
	id integer primary key autoincrement,
	username varchar(40) unique not null,
	consumerKey varchar(40),
	consumerSecret varchar(40),
	clientname varchar(40),
	token varchar(40), 
	refresh_token varchar(40),
	token_expires_at integer
);
drop index if exists agave_user_username;
create index agave_user_username on agave_user(username);

drop table if exists user;
create table user (
	id integer primary key autoincrement,
	username varchar(40) unique not null,
	firstName varchar(40),
	lastName varchar(40),
	email varchar(40)
);

drop index if exists username;
create index username on user(username);

drop table if exists login;
create table login (
	id integer primary key autoincrement,
	username varchar(40) references user(username) not null,
	login_at datetime DEFAULT CURRENT_TIMESTAMP not null
);

drop index if exists login_username;
create index login_username on login(username);

drop table if exists workflow;
create table workflow (
	id integer primary key autoincrement,
	workflow_id varchar(40) unique not null,
	name varchar(40) not null,
	description text,
	json text,
	derived_from varchar(40),
	created_at datetime default CURRENT_TIMESTAMP not null,
	modified_at datetime default CURRENT_TIMESTAMP not null
);

drop index if exists workflow_id;
create index workflow_id on workflow(workflow_id);

drop index if exists workflow_derived_from;
create index workflow_derived_from on workflow(derived_from);

drop table if exists user_workflow;
create table user_workflow (
	id integer primary key autoincrement,
	workflow_id varchar(40) references workflow(workflow_id),
	username varchar(40) references user(username),
	unique(workflow_id, username)
);

drop index if exists username_workflow;
create index username_workflow on user_workflow(username);

drop view if exists user_workflow_view;
create view user_workflow_view as 
select workflow.workflow_id as workflow_id, workflow.name as name, workflow.description as description, workflow.json as json, user_workflow.username as username
from workflow join user_workflow on (workflow.workflow_id = user_workflow.workflow_id);

drop table if exists job;
create table job (
	id integer primary key autoincrement,
	job_id varchar(40) unique not null,
	agave_id varchar(40) unique,
	app_id varchar(40) not null,
	job_json text,
	agave_json text,
	status varchar(40),
	step_id integer,
	workflow_id varchar(40) references workflow(workflow_id),
	username varchar(40) references user(username)
);

drop index if exists job_id;
create index job_id on job(job_id);

drop index if exists job_agave_id;
create index job_agave_id on job(agave_id);

drop index if exists job_username;
create index job_username on job(username);

drop table if exists nextstep;
create table nextstep (
	id integer primary key autoincrement,
	prev varchar(40) references job(job_id),
	next varchar(40) references job(job_id),
	input_name varchar(100) not null,
	input_source varchar(100),
	status integer default 0
);

drop index if exists nextstep_prev;
create index nextstep_prev on nextstep(prev);

drop index if exists nextstep_next;
create index nextstep_next on nextstep(next);

drop table if exists organism;
create table organism (
	id integer primary key autoincrement,
	organism_id varchar(40) not null,
	name varchar(40) not null,
	scientific_name text,
	taxon_id integer(10) not null
);

insert into organism (organism_id, name, scientific_name, taxon_id) values ('2451521911501558246-242ac1111-0001-012', 'rice', 'Oryza sativa', 4530);

drop index if exists organism_id;
create index organism_id on organism(organism_id);

drop table if exists line;
create table line (
	id integer primary key autoincrement,
	line_id varchar(40) not null,
	name varchar(40) not null,
	organism varchar(40) not null references organism(organism_id),
	url text
);

insert into line (line_id, name, organism, url) values ('7673478939677757926-242ac1111-0001-012', 'japonica Nipponbare', '2451521911501558246-242ac1111-0001-012', 'http://rice.plantbiology.msu.edu/');

drop index if exists line_id;
create index line_id on line(line_id);

drop table if exists file;
create table file (
	id integer primary key autoincrement,
	file_id varchar(40) not null,
	system varchar(40),
	path text,
	source varchar(40),
	line varchar(40) references line(line_id),
	replicate varchar(40),
	description text,
	format varchar(40) not null,
	type varchar(40) not null,
	paired_end integer default 0,
	paired_with varchar(40),
	derived_from varchar(40),
	controlled_by varchar(40)
);

insert into file (file_id, system, path, line, type, format, description) values ('9125563603084045850-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/test_genome.fasta', '7673478939677757926-242ac1111-0001-012', 'Reference genome', 'fasta', 'A scaled-down genome (test_genome.fasta) that is comprised of the first 300kb of three chromosomes of rice');
insert into file (file_id, system, path, line, type, format, description) values ('2098345582533939686-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/mRNA.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'mRNA sequences from NCBI');
insert into file (file_id, system, path, line, type, format, description) values ('7293065577372979686-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/msu-irgsp-proteins.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'Publicly available annotated protein sequences of rice (MSU7.0 and IRGSP1.0)');
insert into file (file_id, system, path, line, type, format, description) values ('5471780361112251930-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/plant_repeats.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'A collection of plant repeats');

drop index if exists file_id;
create index file_id on file(file_id);

drop view if exists file_view;
create view file_view as 
select file.system as system, file.path as path, line.name as line_name, organism.name as organism_name, organism.scientific_name as organism_scientific_name, organism.taxon_id as organism_taxon_id 
from file join line on (file.line = line.line_id) join organism on (line.organism = organism.organism_id);
