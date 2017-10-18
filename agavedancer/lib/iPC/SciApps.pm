package iPC::SciApps;

use warnings;
use strict;

use Dancer ':syntax';
use Dancer::Plugin::Ajax;
use Dancer::Plugin::Email;
use Dancer::Plugin::Database;
use Dancer::Plugin::Auth::CAS;
use Dancer::Cookies;
use Dancer::Response;
use Dancer::Exception qw(:all);
use iPC::AgaveAuthHelper ();
use iPC::User ();
use iPC::Addons ();
use iPC::Utils ();
use Agave::Client ();
use Agave::Client::Client ();
use File::Copy ();
use Archive::Tar ();
use FindBin;

our $VERSION = '0.2';
our @EXPORT_SETTINGS=qw/host_url output_url upload_suffix wf_step_prefix datastore public_datastore_type archive_system archive_home archive_path datastore_types/;
our @EXCEPTIONS=qw/InvalidRequest InvalidCredentials DatabaseError SystemError/;

foreach my $exception (@EXCEPTIONS) {
	register_exception($exception, message_pattern => "$exception: %s");
}

sub token_valid {
	my $token=session('token');
	my $tk_expiration = session('token_expiration_at');

	$token && $tk_expiration && $tk_expiration > time() ? 1 : 0;
}

sub _login {
	my ($args)=@_;
	my $ah=iPC::AgaveAuthHelper->new({
			username => $args->{username},
			password => $args->{password},
		}
	);
	my $api;
	if ($ah and $api=$ah->api and $api->token) {
		debug "Token: " . $api->token . "\n";
    session 'username' => $api->{'user'};
    session 'token' => $api->token;
    session 'logged_in' => 1;
    session 'token_expiration_in' => $api->auth->token_expiration_in;
    session 'token_expiration_at' => $api->auth->token_expiration_at;
		print STDERR "Delta: ", $api->auth->token_expiration_in, $/;
	} else {
		raise 'InvalidCredentials' => 'agave login falied';
	}
	1;
}

sub _logout {
	session->destroy();
}

sub agave_login {
	open(AGAVE, setting("appdir") . "/" . setting("agave_config"));
	my $contents = do { local $/;  <AGAVE> };
	close AGAVE;
	my $agave=from_json($contents);

	my $ah=iPC::AgaveAuthHelper->new({
			username => $agave->{username},
			password => $agave->{password},
		}
	);
	my $api;
	if ($ah and $api=$ah->api and $api->token) {
		debug "Token: " . $api->token . "\n";
    session 'username' => $api->{'user'};
    session 'token' => $api->token;
    session 'token_expiration_in' => $api->auth->token_expiration_in;
    session 'token_expiration_at' => $api->auth->token_expiration_at;
		print STDERR "Delta: ", $api->auth->token_expiration_in, $/;
	} else {
		raise 'InvalidCredentials' => 'agave login falied';
	}
	1;
}

sub check_agave_login {
	unless (token_valid()) {
		agave_login();
	}
}

sub getAgaveClient {
	check_agave_login();

	my $username = session('username');
	Agave::Client->new(
		username => $username,
		token => session('token'),
	);
}

sub uncompress_result {
	my ($path)=@_;
	my $path_abs=setting("archive_home") . '/' . $path;
	my $uncompress_suffix= setting("uncompress_suffix");
	chdir $path_abs;
	foreach my $file (glob("*" . $uncompress_suffix)) {
		system("tar --overwrite -xzf $file && rm $file") == 0 or
		print STDERR "uncompress_result error: $!\n";
	}
};

hook on_route_exception => sub {
	my $e = shift;
	if (ref($e) eq 'scalar') {
		raise 'SystemError' => $e;
	} elsif ($e->can('does') && ($e->does('InvalidCredentials') || $e->does('InvalidRequest'))) {
		halt(to_json({status => 'error', error => $e->message()}));
	} else {
		$e->rethrow;
	}
};

hook 'before' => sub {
	my $path=request->path;
	#unless(session('cas_user') || $path eq '/' || $path=~m#^/(login|logout|notification)/?#) {
	if(! session('cas_user') && $path=~m#^/(job|workflowJob)/new/?#) {
		if (request->is_ajax) {
			content_type(setting('plugins')->{Ajax}{content_type});
			try {
				raise InvalidCredentials => 'no cas user';
			} catch {
				my ($e)=@_;
				halt(to_json({error => $e->message()}));
			};
		} else {
			request->path('/');
		}
	} 
};

hook 'after' => sub {
	my $response = shift;
	$response->header('Access-Control-Allow-Origin' => '*');
};

options qr{/.*} => sub {
	headers(
		'Access-Control-Allow-Origin' => '*',
		'Access-Control-Allow-Headers' => 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
		'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
		'Access-Control-Allow-Credentials' => 'true',
	);
};

sub _index {
	my %config=map { $_ => param($_) } qw/app_id page_id wf_id/;
	$config{setting}={map {$_ => setting($_)} @EXPORT_SETTINGS};

	template 'index', {
		config => to_json(\%config),
	};
}

get '/' => sub {
	_index();
};

get '/login' => sub {
	auth_cas();
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my %data=map { $_ => $user->{$_} } qw/username firstName lastName email/;
	try {
		database->quick_insert('user', \%data);
		database->quick_insert('login', {username => $user->{username}});
	};
	_index();
};

get '/logout' => sub {
	my $redirect_url=setting('plugins')->{'Auth::CAS'}{'cas_url'} . '/logout?service=' . request->uri_base;
	_logout();
	return redirect $redirect_url;
};

ajax '/user' => sub {
	my $user=session('cas_user');
	if ($user) {
		$user->{logged_in}=1;
	} else {
		$user={logged_in => 0};
	}
	to_json($user);
};

get qr{/browse/?(.*)} => sub {
	my ($typePath) = splat;
	my ($type, $path)=split /\//, $typePath, 2;
	$path||='';
	my $user=session('cas_user');
	if (($type eq '__CyVerse__') && ! $user) {
 		raise InvalidCredentials => 'no cas user';
 	} elsif ($type eq '__exampleData__') {
 		$type=setting('public_datastore_type');
 	}
	my $username=$user->{username};
	my $datastore=setting('datastore')->{$type};
	unless ($datastore) {
		raise 'InvalidRequest' => 'Invalid Datastore'; 
	}
	my $datastore_home=$datastore->{home};
	my $datastore_path=$datastore->{path};
	my $datastore_system=$datastore->{system};
	my $result={};
	my $datastore_homepath=$datastore_home .'/' . $datastore_path;
	if ($type eq '__CyVerse__') {
 		$datastore_homepath=~s/__user__/$username/;
 		$result=browse_ils($path, $datastore_system, $datastore_homepath);
 	} elsif ($type eq '__sorghumDB__') {
		$result=browse_ls($path, $datastore_system, $datastore_homepath);
	} elsif ($type eq '__MaizeCODE__') {
		$result=browse_ls($path, $datastore_system, $datastore_homepath);
	} elsif ($type eq '__exampleData__') {
		$result=browse_ls($path, $datastore_system, $datastore_homepath);
	} elsif ($type eq '__system__') {
		my ($system, $filepath)=split /\//, $path, 2;
		$result=browse_files($filepath, $system);
	} elsif ($type eq '__output__') {
		$result=browse_output_files($path, $datastore_system, $datastore_homepath);
	}

	to_json($result);
};

sub browse_output_files {
	my ($path, $agave_id, $homepath)=@_;
	$homepath=~s/^\///;

	my $fullPath=$homepath . '/' . $path;

	my $apif=getAgaveClient();
	my $job_ep = $apif->job;
	my $dir_list=$job_ep->job_output_files($agave_id, $fullPath);

	[{
			is_root => $path ? 0 : 1,
			path => $path,
			list => [map {name => $_->{name}, length => $_->{length}, type =>$_ ->{type}}, @$dir_list],
		}];

}

sub browse_ils {
	my ($path, $system, $homepath)=@_;
	my $irodsEnvFile=setting('irodsEnvFile');
	my $fullPath=$homepath . '/' . $path;
	my @ils=`export irodsEnvFile=$irodsEnvFile;export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;ils -l '$fullPath'`;
	chomp (@ils);
	my $dir_list=iPC::Utils::parse_ils(\@ils, $homepath);

	[map +{
			is_root	=> $_ ? 0 : 1,
			path 	=> $_,
			list 	=> $dir_list->{$_},
		}, keys %$dir_list];
}

sub browse_files {
	my ($path, $system)=@_;
	my $apif=getAgaveClient();

	$system='system/' . $system . '/';

	my $io = $apif->io;
	my $dir_list;
	$dir_list=$io->readdir('/' . $system . $path);

	[{
			is_root => $path ? 0 : 1,
			path => $path,
			list => $dir_list,
		}];
}

sub browse_ls {
	my ($path, $system, $homepath)=@_;
	my $fullPath=$homepath . '/' . $path;

	my @ls=`ls -tlR $fullPath`;
	my $dir_list=iPC::Utils::parse_ls(\@ls, $homepath);

	[map +{
			is_root => $_ ? 0 : 1,
			path => $_,
			list => $dir_list->{$_},
		}, keys %$dir_list];
}

ajax '/apps/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApps($app_id);
	to_json($app);
};

ajax '/apps' => sub {
	my $app_list=retrieveApps();
	foreach (@$app_list) {
		my $tag=$_->{isPublic} ? 'Public' : 'Private';
		$_->{tags}||=[];
		push @{$_->{tags}}, $tag;
	}
	to_json($app_list);
};

sub retrieveApps {
	my ($app_id)=@_;
	my $api = getAgaveClient();
	my $return;
	if ($api) {
		my $apps = $api->apps;
		$return = $app_id ? $apps->find_by_id($app_id) : $apps->list;
	}
	$return or raise InvalidRequest => 'no apps found';
}

get '/schema/:id' => sub {
	my $schema_id = param("id");

	my $schema=retrieveSchema($schema_id);
	return to_json($schema);
};

get '/schema' => sub {
	my $schema=retrieveSchema();

	return to_json($schema);
};

sub retrieveSchema {
	my ($schema_id)=@_;

	my $api = getAgaveClient();

	my $meta = $api->schema;
	$meta->list($schema_id);
}

get '/metadata/new' => sub {
	my $json = param("json");
	return to_json({status => "successful"});
};

get '/metadata/:id' => sub {
	my $metadata_id = param("id");

	my $metadata=retrieveMetadata($metadata_id);
	return to_json($metadata);
};

get '/metadata' => sub {
	my $q=param("q");
	my $metadata;
	if ($q) {
		$metadata=retrieveMetadataByQuery($q);
	} else {
		$metadata=retrieveMetadata();
	}
	return to_json($metadata);
};

sub retrieveMetadata {
	my ($metadata_id)=@_;

	my $api = getAgaveClient();

	my $meta = $api->meta;
	$meta->list($metadata_id);
}

sub retrieveMetadataByQuery {
	my ($query)=@_;

	my $api = getAgaveClient();

	my $meta = $api->meta;
	$meta->query($query);
}

ajax '/job/status/' => sub {
	my @job_ids = param_array("id");
	my $jobs=checkJobStatus(@job_ids);
	return to_json($jobs);
};

sub checkJobStatus {
	my @job_ids = @_;
	my $job_ids=join(',', map {"'$_'"} @job_ids);
	my $sql='SELECT * FROM JOB WHERE job_id IN (' . join(',', ('?') x scalar(@job_ids)). ')';
	my $sth=database->prepare_cached($sql);
	$sth->execute(@job_ids);
	my $jobs=$sth->fetchall_arrayref({job_id => 1, status => 1});;
	$sth->finish;
	return $jobs;
}

sub checkWorkflowJobStatus {
	my ($wfid)=@_;
	my @jobs=database->quick_select('job', {workflow_id => $wfid}, {order_by => 'id'});
	my @result;
	foreach my $job (@jobs) {
		my $jobObj={};
		if (my $json=$job->{agave_json}) {
			$jobObj=from_json($json);
		}
		$jobObj->{job_id}=$job->{job_id};
		$jobObj->{status}=$job->{status};
		$jobObj->{appId}=$job->{app_id};
		push @result, $jobObj;
	}
	
	return \@result;
}

ajax qr{/file/(.*)} => sub {
	my ($fullpath)=splat;
	my ($system, $path)=split /\//, $fullpath, 2;
	my $input=database->quick_select('file_view', {system => $system, path => $path}) || {system => $system, path => $path};
	return to_json($input);
};

ajax '/job/:id' => sub {
	my $job_id = param("id");

	my $job=retrieveJob($job_id);
	return $job ? to_json($job) : to_json({status => 'error'});
};

get '/job/:id' => sub {
	my $job_id = param("id");

	my $job=retrieveJob($job_id);
	return $job ? to_json($job) : to_json({status => 'error'});
	if ($job) {
		return template 'job', {
			job => $job,
			job_id => $job_id,
		};
	}
};

sub retrieveJob {
	my ($job_id)=@_;
	my $agave_id=$job_id;
	my $job;

	my $row = database->quick_select('job', {job_id => $job_id}) || database->quick_select('job', {agave_id => $job_id});
	if ($row) {
		if ($row->{status} eq 'FINISHED' || $row->{status} eq 'FAILED') {
			my $jobObj=from_json($row->{agave_json});
			if ($jobObj->{status} && $jobObj->{status} eq $row->{status}) {
				$job=Agave::Client::Object::Job->new($jobObj);
				$job->{job_id}=$row->{job_id};
			}
		} elsif ($row->{job_id} eq $job_id) {
			$agave_id=$row->{agave_id};
		} elsif ($row->{agave_id} eq $job_id) {
			$job_id=$row->{job_id};
		}
	}
	unless ($job) {
		my $apif = getAgaveClient();
		my $job_ep = $apif->job;
		my $retry=2;
		do {
			$job = try { 
				$job_ep->job_details($agave_id) 
			} catch {
				my ($e)=@_;
				error("Error: $e");
				if ($e=~/token (?:expired|inactive)/i || $@=~/invalid credentials/i) {
					raise 'InvalidCredentials' => 'agave login falied';
				}
			};
			$retry--;
		} while (!$job && sleep(1) && $retry);
		if ($job) {
			$job->{job_id}=$job_id;
			my $data={job_id => $job_id, agave_id => $agave_id, app_id => $job->{appId}, agave_json => to_json($job), status => $job->{status}};
			try {
				database->quick_insert('job', $data);
			} catch {
				delete $data->{job_id};
				database->quick_update('job', {job_id => $job_id}, $data);
			};
		}
	}
	return $job;
}

get '/job/:id/remove' => sub {
	my $job_id = param("id");

	my $apif = getAgaveClient();

	my $job_ep = $apif->job;
	my $row = database->quick_select('job', {job_id => $job_id});
	my $st = $job_ep->delete_job($row->{'agave_id'});

	return redirect '/apps';
};

ajax '/workflow/:id/jobStatus' => sub {
	my $wfid=param('id');
	my $jobs=checkWorkflowJobStatus($wfid);
	return to_json($jobs);
};

ajax '/workflow/new' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my $status='success';
	my $wfid=param('_workflow_id');
	my $wfjson=param('_workflow_json');
	my $wfname=param('_workflow_name');
	my $wfdesc=param('_workflow_desc');
	my $data={workflow_id => $wfid, json => $wfjson, name => $wfname, description => $wfdesc};
	try {
		database->quick_insert('workflow', $data);
	};
	try {
		database->quick_insert('user_workflow', {workflow_id => $wfid, username => $username});
	} catch {
		$status='error';
		$data={};
	};
	to_json({status => $status, data => $data});
};

ajax '/workflow/:id/delete' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my $status='success';
	my $wfid=param('id');
	my $result;
	try {
		#$result=database->quick_delete('workflow', {workflow_id => $wfid});
		$result=database->quick_delete('user_workflow', {username => $username, workflow_id => $wfid});
	} catch {
		$status='error';
	};
	$result or $status='error';
	to_json({status => $status});
};

ajax '/workflow/:id/update' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my $wfid=param('id');
	my $wfname=param('_workflow_name');
	my $wfdesc=param('_workflow_desc');
	my $status='success';
	my $data={name => $wfname, description => $wfdesc, modified_at => \"datetime('now')"};
	try {
		my $user_workflow=database->quick_select('user_workflow', {username => $username, workflow_id => $wfid}) or raise 'InvalidRequest' => 'Invalid Workflow';
		database->quick_update('workflow', {workflow_id => $wfid}, $data);
	} catch {
		$status='error';
	};
	to_json({status => $status});
};

ajax '/workflow' => sub {
	my @result;
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	@result=database->quick_select('user_workflow_view', {username => $user->{username}});
	return to_json(\@result);
};

ajax '/workflowJob/new' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my @err = ();
	my $apif = getAgaveClient();
	my $apps = $apif->apps;

	my (@jobs, @step_form);
	my $form = params();
	my $wfid=$form->{_workflow_id};
	my $wfjson=$form->{_workflow_json};
	my $wf=from_json($wfjson);
	my $wfname=$wf->{name};
	my $wfdesc=$wf->{workflowJob};
	my $derived_from=$wf->{derived_from};
	foreach my $step (@{$wf->{'steps'}}) {
		my $app_id=$step->{appId};
		my ($app) = $apps->find_by_id($app_id);
		my ($job_id, $job_form)=prepareJob($username, $app, $form, $step, \@step_form, \@jobs);
		my ($job, $err)=submitJob($username, $apif, $app, $job_id, $job_form);
		$job||={appId => $app_id, job_id => $job_id, archiveSystem => $archive_system, archivePath => $job_form->{archivePath}, status => 'PENDING'};
		if ($job_id) {
			push @jobs, $job;
			push @step_form, $job_form;
		}
	}
	try {
		database->quick_insert('workflow', {workflow_id => $wfid, json => $wfjson, name => $wfname, description => $wfdesc, derived_from => $derived_from});
	};
	return to_json({workflow_id => $wfid, jobs => \@jobs, workflow => $wf});
};

ajax '/job/new/:id' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my @err = ();
	my $app_id = param("id");
	my $apif = getAgaveClient();

	my $apps = $apif->apps;

	my ($app) = $apps->find_by_id($app_id);
	my $form = params();
	my ($job_id, $job_form)=prepareJob($username, $app, $form);
	my ($job, $err)=submitJob($username, $apif, $app, $job_id, $job_form);
	#return;
	if ($job_id && $job && $job->{id}) {
		return to_json($job);
	}
};

any ['get', 'post'] => '/job/new/:id' => sub {
	my $user=session('cas_user') or raise InvalidCredentials => 'no cas user';
	my $username=$user->{username};
	my @err = ();
	my $app_id = param("id");
	my $apif = getAgaveClient();

	my $apps = $apif->apps;
	my ($app) = $apps->find_by_id($app_id);

	my $form = params();
	if ( request->method() eq "POST" ) {
		my ($job_id, $job_form)=prepareJob($username, $app, $form);
		my ($job, $err)=submitJob($username, $apif, $app, $job_id, $job_form);
		if ($job_id && $job && $job->{id}) {
			return redirect '/job/' . $job_id;
		} else {
			push @err, $err;
		}
	}
 	template 'job_new', {
		errors => \@err,
 		app => $app,
		app_inputs => $app->inputs || [],
		app_params => $app->parameters || [],
		name => $app_id,
		username => session('username'),
		form => $form,
	};
};

sub prepareJob {
	my ($username, $app, $form, $step, $step_form, $prev_job)=@_;
	my $app_id=$app->{id};
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my $input_system=setting("input_system");
	my $input_home=setting("input_home");
	my $input_path=setting("input_path");
	my $output_url=setting("output_url");
	my $upload_suffix=setting("upload_suffix");
	my $api = getAgaveClient();

	my $job_id=iPC::Utils::uuid();

	my ($inputs, $parameters) = ([], []);
	if ($app) {
		$inputs = $app->inputs;
		$parameters = $app->parameters;
	}

	my $step_prefix = defined $step ? setting("wf_step_prefix") . $step->{id} . ':' : '';

	my %job_form;
	foreach my $key (@$inputs, @$parameters) {
		my $name=defined $step ? $step_prefix . $key->{id} : $key->{id};
		$job_form{$name}=$form->{$name};
		my $upload_name=$name . $upload_suffix;
		if (exists $form->{$upload_name}) {
			$job_form{$upload_name}=$form->{$upload_name};
		}
	}

	$job_form{maxRunTime}||=$app->{defaultMaxRunTime} && iPC::Utils::cmp_maxRunTime($app->{defaultMaxRunTime}, setting("maxRunTime")) < 0 ? $app->{defaultMaxRunTime} : setting("maxRunTime");

	# hack for the url input
	foreach my $name (keys %job_form) {
		next unless $job_form{$name};
		if ($job_form{$name}=~m#^https://\w+.sciapps.org/results/job-(\w+\-\w+\-\w+\-\w+)[^\/]*/(.*)#) {
			$job_form{$name}='https://agave.iplantc.org/jobs/v2/' . $1 . '/outputs/media/' . $2;
		} elsif ($job_form{$name}=~s#^https://data.sciapps.org/(example_data|sorghumDB|MaizeCODE)/#agave://sciapps.org/$1/#) {
		}
	}
	#	} elsif ($job_form{$name}=~m#^http://www.maizecode.org#) {
	#		$job_form{$name}=~s#^http://www.maizecode.org#agave://$archive_system#;
	#	} else {
	#		$job_form{$name}=~s#^$output_url#agave://$archive_system#;
	#	}
	#}

	# TODO - check arguments

	my $tempdir=$input_path . "/" . iPC::Utils::tempname();
	my $tempdir_abs=$input_home . '/' . $tempdir;
	try {
		foreach my $upload (keys %{request->uploads()}) {
			next unless exists $job_form{$upload};
			my $file=request->upload($upload);
			my $source=$file->tempname;
			my $target_abs=$tempdir_abs . "/" . $file->filename;
			my $target=$tempdir . "/" . $file->filename;
			unless (-d $tempdir_abs) {
				mkdir($tempdir_abs) || error("Error: $!");
				chmod(0775, $tempdir_abs) || error("Error: $!");
			}
			File::Copy::copy($source, $target_abs) or raise 'SystemError' => 'file system error';
			my $input="agave://" . $input_system . "/" . $target;
			delete $job_form{$upload};
			$upload=~s/$upload_suffix$//;
			$job_form{$upload}=$input;
		}
	} catch {
		my ($e)=@_;
		error("Error: $e");
	};

	foreach my $name (keys %job_form) {
		my $n=$name;
		if ($n=~s/^$step_prefix//) {
			$job_form{$n}=delete $job_form{$name};
		}
	}

	foreach my $k (keys %{$step->{inputs}}) {
		my $v=$step->{inputs}{$k};
		if ($v && ref($v)) {
			#my $sf=$step_form->[$v->{step}];
			#$job_form{$k}='agave://' . $input_system . '/' . $sf->{archivePath} . '/' . $v->{output_name};
			$job_form{$k}=$prev_job->[$v->{step}]{job_id} . ':' . $v->{output_name};
		} else {
			$step->{inputs}{$k}=$job_form{$k};
		}
	}

	foreach my $k (keys %{$step->{parameters}}) {
		my $v=$step->{parameters}{$k};
		$step->{parameters}{$k}=$job_form{$k};
	}

	#my ($result_folder)=map {my $t=$_; $t=~s/\W+/-/g; lc($t) . "-" . iPC::Utils::tempname()} ($app_id);
	#$archive_path.= "/" . $result_folder;

	#my $archive_path_abs=$archive_home . "/" . $archive_path;
	#mkdir($archive_path_abs) or print STDERR "Error: can't mkdir $archive_path_abs, $!\n";
	#chmod(0775, $archive_path_abs);
	#open FH, ">", "$archive_path_abs/.htaccess" or error("Error: can't open  ${archive_path_abs}/.htaccess, $!\n") && raise 'SystemError' => 'file system error';
	#print FH "DirectoryIndex ../.index.php?dir=$result_folder\n";
	#close FH;
	
	my $host_url=request->uri_base;
	#my $noteinfo='/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archiveSystem=${JOB_ARCHIVE_SYSTEM}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}';
	my $noteinfo='/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&message=${JOB_ERROR}';
	my $notifications=[
	{
		#event	=> "ARCHIVING_FINISHED",
		event	=> "FINISHED",
		url		=> $host_url . $noteinfo,
	},
	{
		event	=> "RUNNING",
		url		=> $host_url . $noteinfo,
	},
	{
		event	=> "FAILED",
		url		=> $host_url . $noteinfo,
	},
	];

	my $user=session('cas_user');

	$job_form{_email}=$form->{_email} ? $user->{email} : undef;
	$job_form{archive}=0;
	#$job_form{archiveSystem}=$archive_system;
	#$job_form{archivePath}=$archive_path;
	$job_form{notifications}=$notifications;

	my $job_json=to_json(\%job_form);
	my $wfid=$form->{'_workflow_id'};
	my $data={username => $username, job_id => $job_id, app_id => $app_id, job_json => $job_json, status => 'PENDING'};
	if ($wfid) {
		$data->{workflow_id}=$wfid;
		$data->{step_id}=$step->{id};
	}
	try {
		database->quick_insert('job', $data);
		while (my ($k, $v)=each %{$step->{inputs}}) {
			if ($v && ref($v)) {
				my $prev=$prev_job->[$v->{step}]{job_id};
				my $row=database->quick_insert('nextstep', {prev => $prev, next => $job_id, input_name => $job_form{$k}});
			}
		}
	} catch {
		 my ($e)=@_;
		 error("Error: $e");
		 return;
	};
	return ($job_id, \%job_form);
}

sub submitJob {
	my ($username, $apif, $app, $job_id, $job_form)=@_;
	
	return if ! $job_id || database->quick_count('nextstep', {next => $job_id, status => 0});

	my $job_ep = $apif->job;
	my $retry=3;
	my $err;
	while ($retry-- > 0) {
		my $st = try {
			$job_ep->submit_job($app, %$job_form);
		} catch {
			my ($e)=@_;
			$err="Error: $e";
			error($err);
		};
		if ($st) {
			if ($st->{status} eq 'success') {
				my $job = $st->{data};
				database->quick_update('job', {job_id => $job_id}, {agave_id => $job->{id}, agave_json => to_json($job), status => 'PENDING'});
				$job->{job_id}=$job_id;
				$job_ep->share_job($job->{id}, $username, 'READ');
				return ($job);
			} else {
				$err='Error: ' . $st->{message};
				error($err);
			}
		}
		sleep(60) if $retry;
	}
	return (undef, $err);
}

sub resubmitJob {
	my ($job_id)=@_;
	my $apif = getAgaveClient();

	my $apps = $apif->apps;
	my $job=database->quick_select('job', {agave_id => $job_id}) || database->quick_select('job', {job_id => $job_id});
	my $job_form=from_json($job->{job_json});
	my ($app) = $apps->find_by_id($job->{app_id});
	my ($res, $err)=submitJob($job->{username}, $apif, $app, $job->{job_id}, $job_form);
}

any ['get', 'post'] => '/notification/:id' => sub {
	my $params=params;
	my $jobObj=retrieveJob($params->{id});
	my $job=database->quick_select('job', {agave_id => $params->{id}});
	if ($params->{status} eq 'FINISHED' || $params->{status} eq 'FAILED') {
		my $job_form=from_json($job->{job_json});

		if (my $email=$job_form->{_email}) {
			my $template_engine = engine 'template';
			my $content=$template_engine->apply_renderer('job', {job => $params}); 
			my $mail={
				from	=> setting("email"),
				to 		=> $email,
				subject	=> "Job " . $params->{id} ." has changed to status of " . $params->{status},
				body	=> $content,
				type	=> 'html',
			};
			email $mail;
		}
	}
	if ($params->{status} eq 'FINISHED') {
		submitNextJob($job);
		#archiveJob($job);
		#uncompress_result($params->{archivePath});
	} elsif ($params->{status} eq 'FAILED') {
		#resubmitJob($params->{id});
	}
	return;
};

sub archiveJob {
	my ($job)=@_;
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");

	my $apif = getAgaveClient();
	my $io = $apif->io;
	my $jobObj=from_json($job->{agave_json});
	my $source=sprintf("https://agave.iplantc.org/files/v2/media/system/%s/%s", $jobObj->{executionSystem}, $jobObj->{outputPath});
	my $target=sprintf("/system/%s/%s", $archive_system, $archive_path);
	my $res=$io->import_file($target, {urlToIngest => $source});
}

sub updateJob {
	my ($job)=@_;
	my $data={ status => $job->{status} };
	if ($job->{status} eq 'FINISHED' || $job->{status} eq 'FAILED') {
		#$job->{agave_json}=$data->{agave_json}=to_json(retrieveJob($job->{job_id}));
		retrieveJob($job->{job_id});
	};
	#database->quick_update('job', {job_id => $job->{job_id}}, $data);
}

sub submitNextJob {
	my ($job)=@_;

	my $apif = getAgaveClient();

	my $apps = $apif->apps;

	my $prev=database->quick_select('job', {job_id => $job->{job_id}});
	my $jobObj=from_json($prev->{agave_json});
	#my $source=sprintf("https://agave.iplantc.org/files/v2/media/system/%s/%s", $jobObj->{executionSystem}, $jobObj->{outputPath});
	my $source=sprintf("https://agave.iplantc.org/jobs/v2/%s/outputs/media", $jobObj->{id});
	my @next=database->quick_select('nextstep', {prev => $prev->{job_id}, status => 0});
	if (scalar @next) {
		database->quick_update('nextstep', {prev => $prev->{job_id}}, {input_source => $source, status => 1});
	}

	foreach my $next (@next) {
		next if database->quick_count('nextstep', {next => $next->{next}, status => 0});
		my $next_job=database->quick_select('job', {job_id => $next->{next}});
		my $job_form=from_json($next_job->{job_json});
		my @prev=database->quick_select('nextstep', {next => $next->{next}});
		my %input;
		my $count=0;
		foreach (@prev) {
			my (undef, $filename)=split /:/, $_->{input_name};
			$input{$_->{input_name}}=$_->{input_source} . '/' . $filename;
		}
		while (my ($k, $v) = each %$job_form) {
			if (defined $v && exists $input{$v}) {
				$job_form->{$k}=$input{$v};
				$count++;
			}
		}
		if ($count) {
			database->quick_update('job', {job_id => $next->{next}}, {job_json => to_json($job_form)});
			my ($app) = $apps->find_by_id($next_job->{app_id});

			my ($res, $err)=submitJob($next_job->{username}, $apif, $app, $next_job->{job_id}, $job_form);
		}
	}
}

true;
