package iPC::AgaveDemo;
use Dancer ':syntax';

#use Dancer::Plugin::MemcachedFast;
use iPC::AgaveAuthHelper ();
use iPC::User ();
use iPC::Exceptions ();
use Agave::Client ();
use Agave::Client::Client ();
use Agave::Client::Exceptions ();
use Try::Tiny;
use Dancer::Plugin::Ajax;
use Dancer::Plugin::Email;
use Dancer::Plugin::Database;
use File::Copy ();
use Archive::Tar ();
use FindBin;

our $VERSION = '0.2';
our @EXPORT_SETTINGS=qw/host_url output_url upload_suffix wf_step_prefix datastore archive_home/;

sub uuid {
	my $s='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
	my $f=sub {
		my $r=rand()*16|0;
		my $v=$_[0] eq 'x' ? $r : ($r&0x3|0x8);
		return sprintf("%x", $v);
	};
	$s=~s/[xy]/$f->($&)/ge;
	return $s;
}

sub check_uuid {
	my $id=shift;
	$id=~/^[0-9a-f]{8,}-(?:[0-9a-f]{4,}-){2,}[0-9a-f]{3,}$/ ? 1 : 0;
}

sub token_valid {
	my $tk_expiration = session('token_expiration_at');
	my $return;

	$tk_expiration && $tk_expiration > time() ? 1 : 0;
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
		Agave::Exceptions::AuthFailed->throw('Invalid Credentials');
	}
	1;
}

sub _logout {
	session->destroy;
}

sub check_login {
	session('logged_in') && token_valid();
}

sub getAgaveClient {
	my $username = session('username');
	check_login() && $username ?
	Agave::Client->new(
		username => $username,
		token => session('token'),
	) : Agave::Exceptions::AuthFailed->throw('Invalid Credentials');
}

sub tempname {
	my @CHARS = (qw/
		A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
		a b c d e f g h i j k l m n o p q r s t u v w x y z
		0 1 2 3 4 5 6 7 8 9 _
	/);
	join("", map { $CHARS[ int( rand( @CHARS ) ) ] } (1 .. 10));
}

sub cmp_maxRunTime {
	my @t=@_;
	s/://g foreach @t;
	$t[0] <=> $t[1];
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

sub parse_ils {
	my ($ils, $datastore_root)=@_;
	my $path=shift @$ils;
	$path=~m#^$datastore_root/?(.*):#;
	my @content;
	my %result=($1 => \@content);
	$path=$datastore_root . ($1 ? '/' . $1 : '');
	foreach my $line (@$ils) {
		if ($line=~m#^\s+C\-\s+$path/(.*)#) {
			my $name=$1;
			$name=~s/\s+$//;
			push @content, +{
				name	=> $name,
				type	=> 'dir',	
			};
		} else {
			my @f=split /\s+/, $line, 8;
			push @content, +{
				name => $f[7],
				type => 'file',
			};
		}
	}
	\%result;
}

sub parse_ls {
	my ($ls, $file_root)=@_;
	my $regex=qr#^$file_root/?(.*):#;
	my %result;
	#shift @$ls;
	my $path;
	foreach (@$ls) {
		chomp;
		if (m/$regex/) {
			$path=$1;
			$result{$path}=[];
		} else {
			my (@f)=split /\s+/;
			if ($#f >= 8) {
				push @{$result{$path}}, +{
					length  => $f[4],
					name  => $f[8],
					type  => substr($f[0], 0, 1) eq 'd' ? 'dir' : 'file',
				};
			}
		}

		#my (@f)=split /\s+/;
		#push @result, {
		#	length	=> $f[4],
		#	name	=> $f[8],
		#	type	=> substr($f[0], 0, 1) eq 'd' ? 'dir' : 'file',
		#};
	}
	\%result;
};

#get '/' => sub {
#	send_file 'index.html';
#};
#

hook 'after' => sub {
	my $response = shift;
	$response->header('Access-Control-Allow-Origin' => '*');
};

options qr{/.*} => sub {
	headers(
		'Access-Control-Allow-Origin' => '*',
		'Access-Control-Allow-Headers' => 'Origin, X-Requested-With, Content-Type, Accept',
		'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
	);

};

hook on_route_exception => sub {
	my $exception = shift;
	if ($exception->isa('Agave::Exceptions::AuthFailed')) {
		halt(to_json({error => $_->error}));
	} else {
		$exception->rethrow;
	}
};

get '/' => sub {
	my %config=map { $_ => param($_) } qw/app_id page_id wf_id/;
	$config{setting}={map {$_ => setting($_)} @EXPORT_SETTINGS};

	template 'index', {
		config => to_json(\%config),
	};
};

ajax '/login' => sub {
	my ($username, $password)=(param('username'), param('password'));
	if ($username && $password) {
		_login({username => $username, password => $password}); 
	}
	unless( check_login() ) {
		_logout();
	}

	my $result={
		username	=> session('username'),
		logged_in => session('logged_in'),
		token_expiration_at => session('token_expiration_at'),
	};
	print STDERR to_dumper($result);
	to_json($result);
};

ajax '/logout' => sub {
	_logout();
	return to_json({logged_in => 0});
	#return redirect '/';
};

ajax qr{/browse/?(.*)} => sub {
	my ($typePath) = splat;
	my $username=session('username');
	unless (check_login() && $username) {
		Agave::Exceptions::AuthFailed->throw('Invalid Credentials');
	}
	my ($type, $path)=split /:/, $typePath, 2;
	my $datastore=setting('datastore')->{$type};
	unless ($datastore) {
		iPC::Exceptions::InvalidRequest->throw('Invalid Datastore');
	}
	my $datastore_home=$datastore->{home};
	my $datastore_path=$datastore->{path};
	my $datastore_system=$datastore->{system};
	my $result={};
	my $datastore_homepath=$datastore_home .'/' . $datastore_path;
	if ($type eq '__user__') {
		$datastore_homepath=~s/__user__/$username/;
		$result=browse_ils($path, $datastore_homepath, $datastore_system);
	} elsif ($type eq '__shared__') {
		$result=browse_ils($path, $datastore_homepath, $datastore_system);
	} elsif ($type eq '__public__') {
		$result=browse_ls($path, $datastore_homepath, $datastore_system);
	}
	to_json($result);
};

sub browse_ils {
	my ($path, $homepath, $system)=@_;
	my $irodsEnvFile=setting('irodsEnvFile');
	my $fullPath=$homepath . '/' . $path;
	my @ils=`export irodsEnvFile=$irodsEnvFile;ils -l '$fullPath'`;
	chomp (@ils);
	my $dir_list=parse_ils(\@ils, $homepath);

	[map +{
			is_root	=> $_ ? 0 : 1,
			path 	=> $_,
			list 	=> $dir_list->{$_},
		}, keys %$dir_list];
};

#sub browse_datastore {
#	my ($path, $system)=@_;
#	$system||=setting('datastore_system');
#
#	my $apif=getAgaveClient();
#
#	#my $root=$username;
#	my $root='';
#	my $path_to_read = $path ? $path : $root;
#	$system='system/' . $system . '/';
#
#	my $io = $apif->io;
#	my $dir_list;
#	try {
#		$dir_list=$io->readdir('/' . $system . $path_to_read);
#	} catch {
#		if ($_->isa('Agave::Exceptions::HTTPError')) {
#		} else {
#			$_->rethrow;
#		}
#	};
#
#	to_json([{
#			is_root => $path_to_read eq $root ? 1 : 0,
#			path => $path_to_read,
#			list => $dir_list,
#
#		}]
#	);
#}

sub browse_ls {
	my ($path, $homepath, $system)=@_;
	my $fullPath=$homepath . '/' . $path;

	my @ls=`ls -tlR $fullPath`;
	my $dir_list=parse_ls(\@ls, $homepath);

	[map +{
			is_root => $_ ? 0 : 1,
			path => $_,
			list => $dir_list->{$_},
		}, keys %$dir_list];
}

#get qr{/browse/?(.*)} => sub {
#	my ($path) = splat;
#	my $use_file_server=setting('use_file_server');
#	my $system;
#	if ($path=~m#system/([^\/]+)/(.*)#) {
#		$system=$1;
#		$path=$2;
#		$use_file_server=0;
#	}
#	$use_file_server ? browse_server($path) : browse_datastore($path, $system);
#};

ajax '/apps' => sub {
	my $app_list=retrieveApps();
	foreach (@$app_list) {
		my $tag=$_->{isPublic} ? 'Public' : 'Private';
		$_->{tags}||=[];
		push @{$_->{tags}}, $tag;
	}
	to_json($app_list);
};

get qr{/apps/?} => sub {
	my $app_list=retrieveApps();

 	template 'apps', {
 		list => $app_list,
	};
};

ajax '/app/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApps($app_id);
	to_json($app)
};

get '/app/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApps($app_id);
	my ($inputs, $parameters) = ([], []);
	if ($app) {
		$inputs = $app->inputs;
		$parameters = $app->parameters;
	}
 	template 'app', {
 		app => $app,
		app_inputs => $inputs,
		app_params => $parameters,
		id => param("id"),
	};
};

sub retrieveApps {
	my ($app_id)=@_;
	my $api = getAgaveClient();
	my $apps = $api->apps;
	my $return=$app_id ? $apps->find_by_id($app_id) : $apps->list
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
	print STDERR $json . "\n";
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

#get '/jobs/?' => sub {
#	check_login();
#
#	my $username = session('username');
#	my $apif = Agave::Client->new(
#					username => $username,
#					token => session('token'),
#				);
#
#	my $job_ep = $apif->job;
#	my $job_list = $job_ep->jobs;
#	#print STDERR to_dumper($app_list);
#
# 	template 'jobs', {
# 		list => $job_list,
#	};
#};

ajax '/workflow/status/:id' => sub {
	my $wfid=param('id');
	my $jobs=checkWorkflowJobStatus($wfid);
	return to_json($jobs);
};

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
	my @jobs=database->quick_select('job', {workflow_id => $wfid}, {columns => [qw/job_id status/]});
	return \@jobs;
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
	$job->{job_id}=$job_id;
	return to_json($job);
};

get '/job/:id' => sub {
	my $job_id = param("id");

	my $job=retrieveJob($job_id);
	$job->{job_id}=$job_id;
	return to_json($job);
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
		if ($row->{status} eq 'FINISHED') {
			$job=Agave::Client::Object::Job->new(from_json($row->{agave_json}));
		} elsif($row->{job_id} eq $job_id) {
			$agave_id=$row->{'agave_id'};
		}
	}
	unless ($job) {
		my $apif = getAgaveClient();
		my $job_ep = $apif->job;
		my $retry=2;
		do {
			$job = eval { $job_ep->job_details($agave_id) };
    	if ($@) {
				print STDERR $@, $/;
				if ($@=~/token (?:expired|inactive)/i || $@=~/invalid credentials/i) {
					return $@;
				}
			}
			$retry--;
		} while (!$job && sleep(1) && $retry);
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

ajax '/workflow/new' => sub {
	my @err = ();
	my $apif = getAgaveClient();
	my $apps = $apif->apps;

	my (@jobs, @step_form);
	my $form = params();
	my $wf=from_json($form->{'_workflow_json'});
	my $wid=$form->{'_workflow_id'};
	foreach my $step (@{$wf->{'steps'}}) {
		my $app_id=$step->{appId};
		my ($app) = $apps->find_by_id($app_id);
		my ($job_id, $job_form)=prepareJob($app, $form, $step, \@step_form, \@jobs);
		my ($job, $err)=submitJob($apif, $app, $job_id, $job_form);
		if ($job_id) {
			push @jobs, {appId => $app_id, job_id => $job_id, status => 'PENDING'};
			push @step_form, $job_form;
		}
	}
	database->quick_insert('workflow', {workflow_id => $wid, workflow_json => to_json($wf)});
	return to_json({workflow_id => $wid, jobs => \@jobs, workflow => $wf});
};

ajax '/job/new/:id' => sub {
	my @err = ();
	my $app_id = param("id");
	my $apif = getAgaveClient();

	my $apps = $apif->apps;

	my ($app) = $apps->find_by_id($app_id);
	my $form = params();
	my ($job_id, $job_form)=prepareJob($app, $form);
	my ($job, $err)=submitJob($apif, $app, $job_id, $job_form);
	if ($job_id && $job && $job->{id}) {
		my $jobRef=retrieveJob($job_id);
		$jobRef->{job_id}=$job_id;
		database->quick_update('job', {job_id => $job_id}, {agave_json => to_json($jobRef)});
		return to_json($jobRef);
	}
};

any ['get', 'post'] => '/job/new/:id' => sub {
	my @err = ();
	my $app_id = param("id");
	my $apif = getAgaveClient();

	my $apps = $apif->apps;
	my ($app) = $apps->find_by_id($app_id);

	my $form = params();
	if ( request->method() eq "POST" ) {
		my ($job_id, $job_form)=prepareJob($app, $form);
		my ($job, $err)=submitJob($apif, $app, $job_id, $job_form);
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
	my ($app, $form, $step, $step_form, $prev_job)=@_;
	my $app_id=$app->{id};
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my $input_system=setting("input_system");
	my $input_home=setting("input_home");
	my $input_path=setting("input_path");
	my $output_url=setting("output_url");

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
	}

	$job_form{maxRunTime}||=$app->{defaultMaxRunTime} && cmp_maxRunTime($app->{defaultMaxRunTime}, setting("maxRunTime")) < 0 ? $app->{defaultMaxRunTime} : setting("maxRunTime");

	# hack for the url input
	foreach my $name (keys %job_form) {
		next unless $job_form{$name};
		if ($job_form{$name}=~m#^http://data.maizecode.org#) {
			$job_form{$name}=~s#^http://data.maizecode.org#agave://$archive_system/data#;
		} elsif ($job_form{$name}=~m#^http://www.maizecode.org#) {
			$job_form{$name}=~s#^http://www.maizecode.org#agave://$archive_system#;
		} else {
			$job_form{$name}=~s#^$output_url#agave://$archive_system#;
		}
	}

	# TODO - check arguments

	my $tempdir=$input_path . "/" . tempname();
	my $tempdir_abs=$input_home . '/' . $tempdir;
	mkdir($tempdir_abs);
	chmod(0775, $tempdir_abs);
	my $upload_suffix=quotemeta(setting("upload_suffix"));
	eval {
		foreach my $upload (keys %{request->uploads()}) {
			next unless exists $job_form{$upload};
			my $file=request->upload($upload);
			my $source=$file->tempname;
			my $target_abs=$tempdir_abs . "/" . $file->filename;
			my $target=$tempdir . "/" . $file->filename;
			File::Copy::copy($source, $target_abs) or die "Copy failed: $!";
			my $input="agave://" . $input_system . "/" . $target;
			delete $job_form{$upload};
			$upload=~s/$upload_suffix$//;
			$job_form{$upload}=$input;
		}
	};
	if ($@) {
		print STDERR 'Error: ', $@, $/;
	}

	foreach my $name (keys %job_form) {
		my $n=$name;
		if ($n=~s/^$step_prefix//) {
			$job_form{$n}=delete $job_form{$name};
		}
	}

	foreach my $k (keys %{$step->{inputs}}) {
		my $v=$step->{inputs}{$k};
		if ($v && ref($v)) {
			my $sf=$step_form->[$v->{step}];
			$job_form{$k}='agave://' . $input_system . '/' . $sf->{archivePath} . '/' . $v->{output_name};
		} else {
			$step->{inputs}{$k}=$job_form{$k};
		}
	}
	foreach my $k (keys %{$step->{parameters}}) {
		my $v=$step->{parameters}{$k};
		$step->{parameters}{$k}=$job_form{$k};
	}

	my ($result_folder)=map {my $t=$_; $t=~s/\W+/-/g; lc($t) . "-" . tempname()} ($app_id);
	$archive_path.= "/" . $result_folder;
	
	my $host_url=setting("host_url");
	my $noteinfo='/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}';
	my $notifications=[
	{
		event	=> "ARCHIVING_FINISHED",
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

	$job_form{_email}=$form->{_email} || undef;
	$job_form{archive}=1;
	$job_form{archiveSystem}=$archive_system;
	$job_form{archivePath}=$archive_path;
	$job_form{notifications}=$notifications;

	my $job_id=uuid();
	my $job_json=to_json(\%job_form);
	my $wid=$form->{'_workflow_id'};
	my $data={job_id => $job_id, app_id => $app_id, job_json => $job_json, status => 'PENDING'};
	if ($wid) {
		$data->{workflow_id}=$wid;
		$data->{step_id}=$step->{id};
	}
	eval {
		database->quick_insert('job', $data);
		while (my ($k, $v)=each %{$step->{inputs}}) {
			if ($v && ref($v)) {
				my $prev=$prev_job->[$v->{step}]{job_id};
				my $row=database->quick_insert('nextstep', {prev => $prev, next => $job_id, input_name => $job_form{$k}});
			}
		}
	};
	if ($@) {
		print STDERR 'Error: ', $@, $/;
	} else {
		return ($job_id, \%job_form);
	}
}

sub submitJob {
	my ($apif, $app, $job_id, $job_form)=@_;
	
	return unless $job_id;
	
	my @row=database->quick_select('nextstep', {next => $job_id});
	foreach my $row (@row) {
		return unless $row->{status};
	}

	my $job_ep = $apif->job;
	my $st = eval { $job_ep->submit_job($app, %$job_form); };
	if ($@) {
		print STDERR 'Error: ', $@, $/;
	}
	if ($st) {
		if ($st->{status} eq 'success') {
			my $job = $st->{data};
			database->quick_update('job', {job_id => $job_id}, {agave_id => $job->{id}, status => 'PENDING'});
			return ($job);
		} else {
			print STDERR 'Error: ', $st->{message}, $/;
			return (undef, $st->{message});
		}
	}
	return;
}

sub resubmitJob {
	my ($job_id)=@_;
	my $apif = getAgaveClient();

	my $apps = $apif->apps;
	my $job=database->quick_select('job', {agave_id => $job_id}) || database->quick_select('job', {job_id => $job_id});
	my $job_form=from_json($job->{job_json});
	my ($app) = $apps->find_by_id($job->{app_id});
	my ($res, $err)=submitJob($apif, $app, $job->{job_id}, $job_form);
}

any ['get', 'post'] => '/notification/:id' => sub {
	my $params=params;
	if ($params->{status} eq 'ARCHIVING_FINISHED') {
		$params->{status}='FINISHED';
	}
	#print STDERR 'STATUS: ' . $params->{status} . "\n";
	updateJob($params);
	
	if ($params->{status} eq 'FINISHED') {
		next if $params->{message}=~/Attempt [12] to submit job/;
		my $job=database->quick_select('job', {agave_id => $params->{id}});
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
		submitNextJob($params);
		uncompress_result($params->{archivePath});
	} elsif ($params->{status} eq 'FAILED') {
		#resubmitJob($params->{id});
	}
	return;
};

sub updateJob {
	my ($params)=@_;
	my $data={
		status => $params->{status}, 
		agave_json => to_json(retrieveJob($params->{id}))
	};
	database->quick_update('job', {agave_id => $params->{id}}, $data);
}

sub submitNextJob {
	my ($params)=@_;

	my $apif = getAgaveClient();

	my $apps = $apif->apps;

	my $prev=database->quick_select('job', {agave_id => $params->{id}});
	my @next=database->quick_select('nextstep', {prev => $prev->{job_id}, status => 0});
	if (scalar @next) {
		database->quick_update('nextstep', {prev => $prev->{job_id}}, {status => 1});
	}

	foreach my $next (@next) {
		my @incomplete=database->quick_select('nextstep', {next => $next->{next}, status => 0});
		next if scalar @incomplete;
		my $job=database->quick_select('job', {job_id => $next->{next}});
		my $job_form=from_json($job->{job_json});
		my ($app) = $apps->find_by_id($job->{app_id});
	
		my ($res, $err)=submitJob($apif, $app, $job->{job_id}, $job_form);
	}
}

true;
