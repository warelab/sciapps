SET storage_engine=InnoDB;
SET NAMES 'utf8';
SET CHARACTER SET 'utf8';

drop table if exists agave_user;
create table agave_user (
	id integer primary key auto_increment,
	username varchar(40) unique not null,
	consumerKey varchar(40),
	consumerSecret varchar(40),
	clientname varchar(40),
	token varchar(40), 
	refresh_token varchar(40),
	token_expires_at integer,
	index(username)
);

drop table if exists user;
create table user (
	id integer primary key auto_increment,
	username varchar(40) unique not null,
	firstName varchar(40),
	lastName varchar(40),
	email varchar(40),
	index(username)
);

drop table if exists login;
create table login (
	id integer primary key auto_increment,
	username varchar(40) not null references user(username),
	login_at timestamp DEFAULT CURRENT_TIMESTAMP,
	index(username)
);

drop table if exists metadata;
create table metadata (
  id integer primary key auto_increment,
  metadata_id varchar(40) not null,
  tissue varchar(255),
  reverse_read_length integer,
  seq_format varchar(255),
  growth_protocol varchar(255),
  cultivar varchar(255),
  source varchar(255),
  source_details varchar(255),
  library_selection varchar(255),
  library_strategy varchar(255),
  assay varchar(255),
  fragment_size integer,
  design_description varchar(255),
  library_layout varchar(255),
  sra_project_id varchar(255),
  sra_bio_sample_package varchar(255),
  seq_platform varchar(255),
  library_protocol varchar(255),
  age varchar(255),
  stranded varchar(255),
  instrument_model varchar(255),
  forward_read_length integer,
  organism varchar(255),
  library_input varchar(255),
  PhiX varchar(255),
  index(metadata_id),
  index(assay),
  index(tissue),
  index(cultivar),
  index(organism)
);

drop table if exists workflow;
create table workflow (
	id integer primary key auto_increment,
	workflow_id varchar(40) unique not null,
	name varchar(40) not null,
	description text,
	json text,
	derived_from varchar(40),
	created_at timestamp default CURRENT_TIMESTAMP,
	modified_at timestamp,
  metadata_id varchar(40) references metadata(metadata_id),
	index(workflow_id),
	index(derived_from)
);

drop table if exists user_workflow;
create table user_workflow (
	id integer primary key auto_increment,
	workflow_id varchar(40) references workflow(workflow_id),
	username varchar(40) references user(username),
	unique(workflow_id, username),
	index(username)
);

drop view if exists user_workflow_view;
create view user_workflow_view as 
select workflow.workflow_id as workflow_id, workflow.name as name, workflow.description as description, workflow.json as json, user_workflow.username as username, workflow.metadata_id as metadata_id
from workflow join user_workflow on (workflow.workflow_id = user_workflow.workflow_id);

drop table if exists job;
create table job (
	id integer primary key auto_increment,
	job_id varchar(40) unique not null,
	agave_id varchar(40) unique,
	app_id varchar(100) not null,
	job_json text,
	agave_json text,
	status varchar(40),
	step_id integer,
	workflow_id varchar(40) references workflow(workflow_id),
	username varchar(40) references user(username),
	index(job_id),
	index(agave_id),
	index(username)
);

drop table if exists nextstep;
create table nextstep (
	id integer primary key auto_increment,
	prev varchar(40) references job(job_id),
	next varchar(40) references job(job_id),
	input_name varchar(100) not null,
	input_source varchar(255),
	status integer default 0,
	index(prev),
	index(next)
);

drop table if exists organism;
create table organism (
	id integer primary key auto_increment,
	organism_id varchar(40) not null,
	name varchar(40) not null,
	scientific_name text,
	taxon_id integer(10) not null,
	index(organism_id)
);

insert into organism (organism_id, name, scientific_name, taxon_id) values ('2451521911501558246-242ac1111-0001-012', 'rice', 'Oryza sativa', 4530);

drop table if exists line;
create table line (
	id integer primary key auto_increment,
	line_id varchar(40) not null,
	name varchar(40) not null,
	organism varchar(40) not null references organism(organism_id),
	url text,
	index(line_id)
);

insert into line (line_id, name, organism, url) values ('7673478939677757926-242ac1111-0001-012', 'japonica Nipponbare', '2451521911501558246-242ac1111-0001-012', 'http://rice.plantbiology.msu.edu/');

drop table if exists file;
create table file (
	id integer primary key auto_increment,
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
	controlled_by varchar(40),
	index(file_id)
);

insert into file (file_id, system, path, line, type, format, description) values ('9125563603084045850-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/test_genome.fasta', '7673478939677757926-242ac1111-0001-012', 'Reference genome', 'fasta', 'A scaled-down genome (test_genome.fasta) that is comprised of the first 300kb of three chromosomes of rice');
insert into file (file_id, system, path, line, type, format, description) values ('2098345582533939686-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/mRNA.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'mRNA sequences from NCBI');
insert into file (file_id, system, path, line, type, format, description) values ('7293065577372979686-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/msu-irgsp-proteins.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'Publicly available annotated protein sequences of rice (MSU7.0 and IRGSP1.0)');
insert into file (file_id, system, path, line, type, format, description) values ('5471780361112251930-242ac1111-0001-012', 'sciapps.org', 'example_data/maker/plant_repeats.fasta', '7673478939677757926-242ac1111-0001-012', 'Annotation evidence', 'fasta', 'A collection of plant repeats');

drop view if exists file_view;
create view file_view as
select file.system as system, file.path as path, file.type as file_type, file.format as file_format, file.description as file_description, line.name as line_name, organism.name as organism_name, organism.scientific_name as organism_scientific_name, organism.taxon_id as organism_taxon_id
from file join line on (file.line = line.line_id) join organism on (line.organism = organism.organism_id);
