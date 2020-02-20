package iPC::SciApps;

use warnings;
use strict;

use Dancer ':syntax';
#use Dancer::Plugin::Ajax;
use Dancer::Plugin::Email;
use Dancer::Plugin::Database;
use Dancer::Plugin::Swagger;
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
use File::Basename;
use DateTime;

our $VERSION = '0.2';
our @EXPORT_SETTINGS=qw/output_url wf_step_prefix datastore datastore_types archive_system archive_home archive_path appsListMode anon_prefix stage_file_types site_warning_content datamenu_item toolsmenu_item/;
our @EXCEPTIONS=qw/InvalidRequest InvalidCredentials DatabaseError SystemError/;

foreach my $exception (@EXCEPTIONS) {
	register_exception($exception, message_pattern => "$exception: %s");
}

sub token_valid {
	my $user=shift;
	my $token=$user && $user->token || var('token');
	my $tk_expiration=$user && $user->token_expires_at || var('token_expires_at');

	$token && $tk_expiration && $tk_expiration > time() ? $token : 0;
}

sub _logout {
	session->destroy();
}

sub agave_login {
	my $args=shift;
	_agave_login($args);
}

sub _agave_login {
	my $args=shift;
	my $agave;
	try {
		open(AGAVE, setting("appdir") . "/" . setting("agave_config"));
		my $contents = do { local $/;  <AGAVE> };
		close AGAVE;
		$agave=from_json($contents);
	};
	$args||=$agave;

	my $ah=iPC::AgaveAuthHelper->new({
			username => $args->{username},
			password => $args->{password},
		}
	);
	my $api;
  my $token;
	if ($ah and $api=$ah->api and $api->token) {
    my $user=_get_user($args->{username}, $api->token);
    _set_user_var($user);
		_store_auth_session($api->auth);
    $token=$api->token;
	} else {
		raise 'InvalidCredentials' => 'agave login falied';
	}
  $token;
}

sub _get_user {
	my ($username, $token)=@_;
  my ($user, $default);
  $default=defined $token ? iPC::User->search({username => setting('defaultUser'), token => $token}) : undef;
  if (! $token) {
    $user=defined $username ? iPC::User->search({username => $username}) : undef;
  } elsif ($default) {
    $user=$default;
  }
  $user;
}

sub _set_user_var {
  my ($user)=@_;
  if ($user) {
    var $_ => $user->$_ foreach qw/token refresh_token token_expires_at/;
    var agave_client => getAgaveClient($user);
  }
  $user;
}

sub _store_auth_session {
	my $auth=shift;
	if ($auth && ref($auth) eq 'Agave::Client::Auth') {
		debug "Token: " . $auth->{access_token} . "\n";
    session 'username' => $auth->{user};
    session 'token' => $auth->{access_token};
    session 'refresh_token' => $auth->{refresh_token};
    session 'token_expires_in' => $auth->token_expiration_in;
    session 'token_expires_at' => $auth->token_expiration_at;
		print STDERR "Delta: ", $auth->token_expiration_in, $/;
	};
}

sub agave_refresh {
	my $user=shift;
	my $username=$user && $user->username || var('username');
	my $token=$user && $user->token || var('token');
	my $refresh_token=$user && $user->refresh_token || var('refresh_token');
	my $new_token;
	if ($username && $token && $refresh_token) {
		my $apio=Agave::Client->new(
			username => $username,
			token => $token,
		);

		my $ah=iPC::AgaveAuthHelper->new({
				username => $username,
				apio => $apio,
			}
		);
		try {
			$new_token=$ah->refresh($refresh_token)
		};
		if ($new_token) {
			my $auth=$apio->auth;
      my $user=_get_user($username, $new_token);
      _set_user_var($user);
			_store_auth_session($auth);
		}
	}
	$new_token;
}

sub check_agave_login {
	my $user=shift;
  unless (token_valid($user)) {
    agave_login();
  }
	token_valid($user);
}

sub getAgaveClient {
	my $user=shift;
  check_agave_login($user) ? Agave::Client->new(
		username => $user && $user->username || var('username'),
		token => $user && $user->token || var('token'),
	) : undef;
}

hook on_route_exception => sub {
	my $e = shift;
  my $dt=DateTime->now->datetime;
	if ($e->can('does') && ($e->does('InvalidCredentials') || $e->does('InvalidRequest'))) {
		error("Error [$dt]: " . $e->message() . "\n");
    content_type 'application/json';
		halt(to_json({status => 'error', error => $e->message()}));
	} elsif ($e->can('rethrow')) {
		$e->rethrow;
	} else {
		error("Error [$dt]: " . $e . "\n");
		raise 'SystemError' => $e;
	}
};

hook 'before' => sub {
  my $username=request->header('user') || request->header('username') || (session('cas_user') ? session('cas_user')->{username} : undef);
  my $token=request->header('Authorization') || session('token');
  if ($username && $token) {
    $token=~s/^Bearer\s+//;
    if (my $user=_get_user($username, $token)) {
      _set_user_var($user);
      var username => $username;
    }
  }

	my $params = params();
  my $upload=request->upload(setting('upload_file_input'));
  my $inputs=delete $params->{setting('user_params_input')};
  if ($upload || $inputs) {
    my $json_params={};
    try {
      $upload and $json_params = {%$json_params, %{from_json($upload->content())}};
    };
    try {
      if ($inputs && ! ref($inputs)) {
        $inputs=from_json($inputs);
      }
      $inputs and $json_params = {%$json_params, %$inputs};
    };
    if ($json_params && ref($json_params) eq 'HASH') {
      while (my ($k, $v)=each %$json_params) {
        exists $params->{$k} or $params->{$k}=$v;
      }
    }
  }

	my $path=request->path;
	if ($path=~m#^/(job|workflowJob)/new/?# && ! check_agave_login()) {
		if (request->is_ajax) {
      raise InvalidCredentials => 'no username';
		} else {
			request->path('/');
		}
	}
};

sub _index {
	my %config=map { $_ => param($_) } qw/app_id page_id wf_id data_item/;
	$config{setting}={map {$_ => setting($_)} @EXPORT_SETTINGS};
	if (+setting('site_warning')) {
		my $contents;
		try {
			open(WARNING, setting("appdir") . "/" . setting("site_warning_file"));
			$contents = do { local $/;  <WARNING> };
			close WARNING;
		};
		$contents=~s/\s+/ /gms;
		$config{setting}{site_warning_content}=$contents;
	}

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
  my $username=$user->{username};
  if (my $token=agave_login()) {
    var username => $username;
    my %data=(username => $username);
    my $apif=var('agave_client');
    my $profile=$apif->profile;
    my $user_profile=$profile->list($username);
    $data{firstName}=$user_profile->{first_name};
    $data{lastName}=$user_profile->{last_name};
    $data{email}=$user_profile->{email};
    try {
		  database->quick_insert('user', \%data);
    } catch {
      database->quick_update('user', {username => $username}, \%data);
    };
    try {
		  database->quick_insert('login', {username => $username});
    };
	};
	_index();
};

get '/logout' => sub {
	my $redirect_url=setting('plugins')->{'Auth::CAS'}{'cas_url'} . '/logout?service=' . request->uri_base;
	_logout();
	return redirect $redirect_url;
};

get '/user' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
  my $user=database->quick_select('user', {username => $username});
  if ($user) {
    $user->{authenticated}=1;
    if (iPC::User->search({username => $username})) {
      $user->{authorized}=1;
      $user->{token}=check_agave_login();
    }
    #$user->{datastore_verified}=check_datastore();
  }
  content_type 'application/json';
	to_json({status => 'success', data => $user});
};

sub check_datastore {
  my $datastore_home=browse('__home__/');
  my $result;
  try {
    $result=defined $datastore_home->[0] ? 1 : 0;
  };
  return $result;
}

get qr{/browse/?(.*)} => sub {
	my ($typePath) = splat;
	my $nopath=param('nopath');
	my $result=browse($typePath, undef, $nopath);
  content_type 'application/json';
	to_json({status => 'success', data => $result});
};

sub browse {
	my ($typePath, $username, $nopath) = @_;
	my ($type, $path)=split /\//, $typePath, 2;
	$path||='';
	$username||= var('username') || '';
	#unless ($type eq '__exampleData__' || $username) {
	#	raise InvalidCredentials => 'no username';
	#}
	my $datastore=setting('datastore')->{$type};
	unless ($datastore) {
		raise 'InvalidRequest' => 'Invalid Datastore'; 
	}
	my $datastore_home=$datastore->{home};
	my $datastore_path=$datastore->{path};
	my $datastore_system=$datastore->{system};
	$datastore_path=~s/__user__/$username/;
	my $result=[];
	my $datastore_homepath=$nopath ? $datastore_home : $datastore_home .'/' . $datastore_path;
	if ($type eq '__exampleData__') {
		$result=browse_ls($path, $datastore_system, $datastore_homepath);
	} elsif ($type eq '__system__') {
		my ($system, $filepath)=split /\//, $path, 2;
		$result=browse_files($filepath, $system);
	} else {
		#if (substr($path, 0, length($datastore_path)) eq $datastore_path) {
		#	$path=substr($path, length($datastore_path));
		#	$path=~s/^\///;
		#}
		#$result=browse_files($path, $datastore_system, $datastore_path);
		$result=browse_ils($path, $datastore_system, $datastore_homepath);
	}

	$result=[sort {$a->{path} cmp $b->{path}} @$result];
	foreach my $item (@$result) {
		$item->{list}=[sort {$a->{type} cmp $b->{type} || $a->{name} cmp $b->{name}} @{$item->{list}}]
	}

	return $result;
};

sub browse_output_files {
	my ($path, $agave_id, $homepath)=@_;
	my $apif=var("agave_client");
	$homepath=~s/^\///;
	my $fullPath=$homepath . '/' . $path;
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
	my $fullPath=qq('$homepath/$path');
	my @ils=icommand('ils', '-l', $fullPath);
	chomp (@ils);
	my $dir_list=scalar @ils ? iPC::Utils::parse_ils(\@ils, $homepath) : {};

	[map +{
			is_root	=> $_ ? 0 : 1,
			path 	=> $_,
			list 	=> $dir_list->{$_},
		}, sort keys %$dir_list];
}

sub browse_files {
	my ($path, $system, $homepath)=@_;
	my $apif=var("agave_client");
	my $fullpath=$homepath ? $homepath . '/' . $path : $path;

	$system='system/' . $system . '/';

	my $io = $apif->io;
	my $dir_list;
	$dir_list=$io->readdir('/' . $system . $fullpath);

	[{
			is_root => $path ? 0 : 1,
			path => $path,
			list => $dir_list,
		}];
}

sub browse_ls {
	my ($path, $system, $homepath, $noRecursive)=@_;
	my $fullPath=$homepath . '/' . $path;
	my $option='-tl' . ($noRecursive ? '' : 'R');

	my @ls=`ls $option $fullPath`;
	my $dir_list=iPC::Utils::parse_ls(\@ls, $homepath);

	[map +{
			is_root => $_ ? 0 : 1,
			path => $_,
			list => $dir_list->{$_},
		}, sort keys %$dir_list];
}

sub icommand {
	my ($cmd, $opt, @arg)=@_;
	my $irodsEnvFile=setting('irodsEnvFile');
	my @return=`export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;$cmd $opt @arg`;
}

swagger_path {
  parameters => [
    id => { required => 1, in => 'path', description => 'app id' },
  ],
  responses => {
    default => { description => 'get apps by id' }
  },
},
get '/apps/:id' => sub {
	my $app_id = param("id");
	my $app=$app_id && retrieveApps($app_id);
	$app or raise InvalidRequest => 'no apps found';
  content_type 'application/json';
	to_json({status => 'success', data => $app});
};

swagger_path {
  responses => {
    default => { description => 'get apps' }
  },
},
get '/apps' => sub {
	my $mode=param('mode');
	my $local=! $mode || $mode eq 'local' ? retrieveAppsFile() : [];
	my $remote=! $mode || $mode eq 'remote' ? retrieveAppsRemote() : [];

	my $apps=$local;
	foreach (@$remote) {
		my $tag=$_->{isPublic} ? 'Public' : 'Private';
		$_->{tags}||=[];
		push @{$_->{tags}}, $tag;
		push @$apps, $_ unless $_->{isPublic};
	}
	scalar(@$apps) or raise InvalidRequest => 'no apps found';
  content_type 'application/json';
	to_json({status => 'success', data => $apps});
};

sub retrieveApps {
	my ($app_id)=@_;
	retrieveAppsFile($app_id) || retrieveAppsRemote($app_id);
}


sub retrieveAppsFile {
	my ($app_id)=@_;
	my $return;
	if ($app_id) {
		try {
			my $appsFile=setting("appdir") . '/public/assets/' . $app_id . '.json';
      if (-r $appsFile) {
			  my $appsJson=`cat $appsFile`;
			  $return=from_json($appsJson);
      }
		};
	} else {
		try {
			my $default_list=setting("appdir") . '/' . setting('defaultAppsList');
      if (-r $default_list) {
			  my $appsListJson=`cat $default_list`;
			  $return=from_json($appsListJson);
      }
		}
	}
	$return;
}

sub retrieveAppsRemote {
	my $username=var('username') or return [];
	my $save=+setting('appsLocalCache');
	my ($app_id)=@_;
	my $return;
	my $api=var("agave_client");
	if ($api) {
		my $apps = $api->apps;
		if ($app_id) {
			my $retry=setting('retry_num');
			foreach (0 .. $retry) {
				$return=$apps->find_by_id($app_id);
				last if (!$return->{inputs} || ! $return->{inputs}[0] || defined($return->{inputs}[0]{value}{visible})) && (!$return->{parameters} || ! $return->{parameters}[0] || defined($return->{parameters}[0]{value}{visible}));
			}
			
			$save and try {
				my $file=setting("appdir") . '/public/assets/' . $app_id . '.json';
				unless (-f $file) {
					open FILE, ">", $file or error("Error: can't open $file, $!");
					print FILE to_json($return);
					close FILE;
				}
			};
		} else {
			$return=$apps->list(limit => 1000);
		}
	}
	$return;
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

get qr{/file/(.*)} => sub {
	my ($fullpath)=splat;
	my ($system, $path)=split /\//, $fullpath, 2;
	my $input=database->quick_select('file_view', {system => $system, path => $path}) || {system => $system, path => $path};
  content_type 'application/json';
	return to_json($input);
};

swagger_path {
  parameters => [
    id => { required => 1, in => 'path', description => 'job id' },
  ],
  responses => {
    default => { description => 'get job by id' }
  },
},
get '/job/:id' => sub {
	#my $username=session('username') or raise InvalidCredentials => 'no username';
	my $username=var("username");
	my $job_id = param("id");
	my $check=param("check");

	my $job=retrieveJob($job_id, $username, $check);
  content_type 'application/json';
	$job ? to_json({status => 'success', data => $job}) : raise InvalidRequest => 'no jobs found';
};

sub retrieveJob {
	my ($job_id, $username, $check)=@_;
	my $agave_id=$job_id;
	my $job;
	my $retry_interval=setting('retry_interval');

	my $row = database->quick_select('job', {job_id => $job_id}) || database->quick_select('job', {agave_id => $job_id});
	if ($row) {
		if ($row->{status} && ($row->{status} eq 'FINISHED' || $row->{status} eq 'FAILED')) {
			my $jobObj=from_json($row->{agave_json});
			if ($jobObj->{status} && $jobObj->{status} eq $row->{status}) {
				#$job=Agave::Client::Object::Job->new($jobObj);
				$job=$jobObj;
				$job->{job_id}=$row->{job_id};
			}
		} elsif ($row->{job_id} eq $job_id) {
			$agave_id=$row->{agave_id};
		} elsif ($row->{agave_id} eq $job_id) {
			$job_id=$row->{job_id};
		}
    $username||=$row->{username};
	}

  unless (var("agave_client")) {
    agave_login();
    var username => $username;
  }

  #unless ($check || $job || ! $username) {
  unless ($check || $job) {
		my $apif = var("agave_client");
		my $job_ep = $apif->job;
		my $retry=setting('retry_num');
		do {
			$job = try { 
				$job_ep->job_details($agave_id) 
			} catch {
				my ($e)=@_;
				error("Error: $e");
				if ($e=~/token (?:expired|inactive)/i || $@=~/invalid credentials/i) {
					raise 'InvalidCredentials' => 'agave login falied';
				} elsif ($e=~/User does not have permission/) {
					raise 'InvalidCredentials' => 'user has no permission';
				}
			};
			$retry--;
		} while (!$job && sleep($retry_interval) && $retry);
		if ($job) {
			$job->{job_id}=$job_id;
			my %data=(agave_id => $agave_id, app_id => $job->{appId}, agave_json => to_json($job), status => $job->{status});
			try {
				database->quick_insert('job', {job_id => $job_id, %data});
			} catch {
				database->quick_update('job', {job_id => $job_id}, \%data);
			};
			if ($job->{status} eq 'FINISHED') {
        $job_ep->share_job($job->{id}, $username, 'READ');
				#submitQueuedJob({job_id => $job_id, %data});
				submitNextJob({job_id => $job_id, %data});
				shareOutput({job_id => $job_id, %data});
			} elsif ($job->{status} eq 'FAILED') {
        $job_ep->share_job($job->{id}, $username, 'READ');
				terminateNextJob({job_id => $job_id, %data});
			}
		}
	}
  if ($job) {
    $job->{remoteSubmitted}||=$job->{submitTime} || '';
    $job->{remoteStarted}||=$job->{startTime} || '';
    $job->{remoteEnded}||=$job->{endTime} || '';
  } elsif ($row) {
		$job={
			job_id => $row->{job_id},
			status => $row->{status},
			appId => $row->{app_id},
		};
	}
	$job;
}

get '/workflow/:id/jobStatus' => sub {
	my $wfid=param('id');
	my $jobs=checkWorkflowJobStatus($wfid);
  content_type 'application/json';
	return to_json({status => 'success', data => $jobs});
};

any ['get', 'post'] => '/workflow/remote' => sub {
	my $data;
	my $url=param('_url');
	my $ua=LWP::UserAgent->new();
	$ua->timeout(3);
	my $res=$ua->get($url);
	if ($res->is_success) {
		$data=$res->decoded_content;
	} else {
		raise InvalidRequest => 'can not fetch json from remote url'; 
	}
  content_type 'application/json';
	return to_json({status => 'success', data => $data});
};

swagger_path {
  parameters => [
    job_id => { required => 1, description => 'job ids in json array' },
    workflow_name => { description => 'workflow name' },
    workflow_desc => { description => 'workflow description' },
    save => { description => "save to my workflow if set" }
  ],
  responses => {
    default => { description => 'build workflow from job_id' }
  },
},
post '/workflow/build' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
  my $form=params();
  my $job_id=from_json($form->{job_id});
  my $wfid=iPC::Utils::uuid();
  my $wfname=$form->{workflow_name}||='my_workflow';
  my $wfdesc=$form->{workflow_desc}||='';
  my $workflow=buildWorkflow($job_id, $wfid, $wfname, $wfdesc);
  my $save=$form->{save};
  if ($save) {
	  try {
		  database->quick_insert('workflow', {workflow_id => $wfid, name => $wfname, description => $wfdesc, json => to_json($workflow)});
		  database->quick_insert('user_workflow', {workflow_id => $wfid, username => $username});
	  };
  }
  return to_json({status => 'success', data => $workflow});
};

sub buildWorkflow {
  my ($job_id, $wfid, $wfname, $wfdesc)=@_;
  my $workflow={
    workflow_id => $wfid,
    id  => $wfid,
    name  => $wfname,
    description => $wfdesc,
    steps => []
  };
  unless (ref($job_id)) {
    $job_id=[$job_id];
  }
  my @jobs=sort {
  $a->{submitTime} cmp $b->{submitTime}
  } grep $_, map {
  my $job=database->quick_select('job', {job_id => $_}) || database->quick_select('job', {agave_id => $_});
  $job ? from_json($job->{agave_json}) : undef;
  } @$job_id;
  my $outputs={};
  foreach my $i (0 .. $#jobs) {
    my $job=$jobs[$i];
    my $step=_buildWfStep($job, $i, $outputs);
    push @{$workflow->{steps}}, $step;
    my $app=retrieveApps($job->{appId});
    foreach my $output (@{$app->{outputs} || []}) {
      my $filePath=$job->{archivePath} ? $job->{archivePath} : $job->{id} . '/outputs/media';
      my $path=$filePath . '/' . $output->{id};
      $outputs->{$path}={step => $i+1, output_name => $output->{id}};
    }
  }
  $workflow;
}

sub _buildWfStep {
  my ($job, $index, $outputs)=@_;
  my $step={
    id  => $index+1 ,
    appId => $job->{appId},
    jobId => $job->{id},
    inputs  => {},
    parameters  => $job->{parameters}
  };
  while (my ($ik, $iv) = each %{$job->{inputs}}) {
    my $input_name=ref($iv) ? $iv : [$iv];
     $step->{inputs}{$ik}=[];
     foreach my $i (0 .. $#$input_name) {
       my $name=$input_name->[$i];
       my $output;
       while (my ($ok, $ov) = each %$outputs) {
         if ($name=~m/\Q$ok\E/) {
           $output=$ov;
           last;
         }
       }
       $step->{inputs}{$ik}[$i]=$output ? $output : $name;
     }
  }
  $step;
}

swagger_path {
  parameters => [
    workflow_name => { required => 1, description => 'workflow name' },
    id => { description => 'workflow id' },
    workflow_desc => { description => 'workflow description' },
    workflow_json => { description => 'workflow json' },
  ],
  responses => {
    default => { description => 'save new workflow' }
  },
},
post '/workflow/new' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
  my $form=params();
	my $wfid=$form->{id}||=iPC::Utils::uuid();
	my $wfjson=$form->{workflow_json};
	my $wfname=$form->{workflow_name};
	my $wfdesc=$form->{workflow_desc};
	my $wf;
  if ($wfjson) {
    $wf=from_json($wfjson);
    my @jobs=database->quick_select('job', {workflow_id => $wfid});
    my %jobs=map {$_->{job_id} => $_} @jobs;
    foreach my $step (@{$wf->{steps}}) {
      if ($step->{jobId} and my $job=$jobs{$step->{jobId}}) {
        $job->{agave_id} and $step->{jobId}=$job->{agave_id};
      }
		}
	}

	my %data=(name => $wfname, description => $wfdesc);
	try {
		database->quick_insert('workflow', {workflow_id => $wfid, %data, json => $wf ? to_json($wf) : ''});
		database->quick_insert('user_workflow', {workflow_id => $wfid, username => $username});
	} catch {
		my $user_workflow=database->quick_select('user_workflow', {username => $username, workflow_id => $wfid}) or database->quick_insert('user_workflow', {workflow_id => $wfid, username => $username});
		database->quick_update('workflow', {workflow_id => $wfid}, \%data);
	};
  content_type 'application/json';
	to_json({status => 'success', data => {workflow_id => $wfid, %data, steps => $wf ? $wf->{steps} : []}});
};

swagger_path {
  parameters => [
    id => { in => 'path', required => 1, description => 'workflow id' },
  ],
  responses => {
    default => { description => 'get workflow metadata by id' }
  },
},
get '/workflow/:id/metadata' => sub {
  #my $username=var("username") or raise InvalidCredentials => 'no username';
	my $wfid=param('id');
  my $data;
  my $wf=database->quick_select('workflow', {workflow_id => $wfid});
  if ($wf && $wf->{metadata_id}) {
    $data=database->quick_select('metadata', {metadata_id => $wf->{metadata_id}});
  }
  $data or raise InvalidRequest => 'no workflow metadata found';
  delete $data->{id};
  content_type 'application/json';
	to_json({status => 'success', data => $data});
};

swagger_path {
  parameters => [
    id => { in => 'path', required => 1, description => 'workflow id' },
  ],
  responses => {
    default => { description => 'delete workflow by id' }
  },
},
get '/workflow/:id/delete' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my $wfid=param('id');
	try {
		database->quick_delete('user_workflow', {username => $username, workflow_id => $wfid});
	} catch {
		raise InvalidRequest => 'can not delete workflow';
	};
  content_type 'application/json';
	to_json({status => 'success'});
};

swagger_path {
  parameters => [
    id => { in => 'path', required => 1, description => 'workflow id' },
    workflow_name => { required => 0, description => 'workflow name' },
    workflow_desc => { required => 0, description => 'workflow description' },
    metadata => { required => 0, description => 'sample metadata' },
    new_id => { required => 0, description => 'new workflow id' },
  ],
  responses => {
    default => { description => 'update workflow by id' }
  },
},
post '/workflow/:id/update' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my $wfid=param('id');
	my $wfname=param('workflow_name');
	my $wfdesc=param('workflow_desc');
  my $newid=param('new_id');
  my $metadata=param('metadata');
	my $data={modified_at => \"now()"};
  if (defined $wfname && length($wfname)) {
    $data->{name}=$wfname;
  }
  if (defined $wfdesc && length($wfdesc)) {
    $data->{description}=$wfdesc;
  }
  if ($metadata) {
    my $sth = database->column_info(undef, undef, 'metadata', undef);
    my $col=$sth->fetchall_arrayref({COLUMN_NAME => 1});
    my $mdata={map {$_->{COLUMN_NAME} => undef} @$col};
    try {
      my $metadataObj=ref $metadata ? $metadata : from_json($metadata);
      foreach my $avu (@{$metadataObj->{avus}}) {
        if (exists $mdata->{$avu->{attr}}) {
          $mdata->{$avu->{attr}}=$avu->{value};
        }
      }
      my $meta=database->quick_select('metadata', $mdata);
      if ($meta) {
        $data->{metadata_id}=$meta->{metadata_id};
      } else {
        $mdata->{metadata_id}=iPC::Utils::uuid();
        database->quick_insert('metadata', $mdata);
        $data->{metadata_id}=$mdata->{metadata_id};
      }
    };
  }
  database->{AutoCommit} = 0;
	try {
		database->quick_count('user_workflow', {username => $username, workflow_id => $wfid}) or raise 'InvalidRequest' => 'Invalid Workflow';
    my $wf=database->quick_select('workflow', {workflow_id => $wfid});
    my $wfObj=from_json($wf->{json});
    if ($data->{name} || $data->{description}) {
      $data->{name} and $wfObj->{name}=$data->{name};
      $data->{description} and $wfObj->{description}=$data->{description};
      $data->{json}=to_json($wfObj);
    }
		database->quick_update('workflow', {workflow_id => $wfid}, $data);
    if ($newid) {
      database->quick_count('user_workflow', {username => $username, workflow_id => $newid}) or raise 'InvalidRequest' => 'Invalid New Workflow';
      my $newwf=database->quick_select('workflow', {workflow_id => $newid});
      my $newWfObj=from_json($newwf->{json});

      $newWfObj->{id}=$newWfObj->{workflow_id}=$wfid;
      $newWfObj->{name}=$wf->{name};
      $newWfObj->{description}=$wf->{description};
	    $data={json => to_json($newWfObj), modified_at => \"now()"};
      database->quick_update('workflow', {workflow_id => $wfid}, $data);
    }
    database->commit;
	} catch {
    eval { database->rollback };
		raise 'InvalidRequest' => $_; 
	};
  content_type 'application/json';
	to_json({status => 'success', data => retrieveWorkflow($wfid)});
};

swagger_path {
  parameters => [
    id => { in => 'path', required => 1, description => 'workflow id' },
  ],
  responses => {
    default => { description => 'get workflow by id' }
  },
},
get '/workflow/:id' => sub {
	my $wfid=param('id');
	my $wf=retrieveWorkflow($wfid);
	$wf or raise InvalidRequest => 'no workflow found';
  content_type 'application/json';
	to_json({status => 'success', data => $wf});
};

sub retrieveWorkflow {
	my ($wfid)=@_;
	retrieveWorkflowFile($wfid) || retrieveWorkflowDB($wfid);
}

sub retrieveWorkflowFile {
	my ($wfid)=@_;
	my $wf;
	try {
		my $wfFile=setting("appdir") . '/public/assets/' . $wfid . '.workflow.json';
    if (-r $wfFile) {
		  my $wfJson=`cat $wfFile`;
		  $wf=from_json($wfJson);
		  $wf->{workflow_id}=$wf->{id};
    }
	};
	$wf;
};

sub retrieveWorkflowDB {
	my ($wfid)=@_;
	my $wf;
	try {
		$wf=database->quick_select('workflow', {workflow_id => $wfid});
		my $wfObj=from_json(delete $wf->{json});
		$wf->{id}=$wf->{workflow_id};
		$wf->{steps}=$wfObj->{steps};
	};
	$wf;
}

swagger_path {
  parameters => [
    dataItem => { description => 'data project prefix' },
    searchTokens => { description => 'search tokens concatenated by "+"' },
  ],
  responses => {
    default => { description => 'get workflows' }
  },
},
get '/workflow' => sub {
  my $data_item=param("dataItem");
  my $search_tokens=param("searchTokens");
  my @tokens=$search_tokens ? map {quotemeta} split /\++/, $search_tokens : ();
	my @result;
	my $username=$data_item ? setting('defaultUser') : var("username") or raise InvalidCredentials => 'no username';
  my $where={username => $username};
  if ($data_item) {
    if (setting('datamenu_item')->{$data_item}) {
      $where->{name}={like => setting('datamenu_item')->{$data_item} . "%"};
    } else {
      $where->{name}=undef;
    }
  }

	@result=map {delete $_->{username}; my $obj=$_->{json} ? from_json(delete $_->{json}) : undef; $obj and $_->{steps}=$obj->{steps}; $_;} reverse database->quick_select('user_workflow_view', $where);

  my $token_num=scalar @tokens;

  if ($token_num) {
    @result=grep {
      my $valid=0;
      my $res=$_;
      foreach my $val (values %$res) {
        my $has_invalid=0;
        my $targetVal=defined $val ? (ref($val) ? to_json($val) : $val) : "";
        next unless length($targetVal) > 0;
        foreach my $token (@tokens) {
          unless($targetVal=~/$token/mi) {
            $has_invalid=1;
            last;
          }
        }
        $valid=1 unless $has_invalid;
      }
      $valid;
    } @result;
  }

  content_type 'application/json';
	return to_json({status => 'success', data => \@result});
};

swagger_path {
  parameters => [
    paramsFromUser => 'params encoded in json',
    runWorkflowJob  => 'flag to run workflow',
    workflow_name => { description => 'workflow name' },
    workflow_desc => { description => 'workflow description' },
  ],
  responses => {
    default => { description => 'prepare new workflow run' }
  },
},
post '/workflowJob/new' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my $form = params();
  content_type 'application/json';
  my $result=prepareWorkflowJob($form, $username);
  $form->{runWorkflowJob} && $result && runWorkflowJob($result->{data}{workflow_id}, $username);
  $result ? to_json($result) : raise InvalidRequest => 'workflow submission failed';
};

sub prepareWorkflowJob {
  my ($form, $username)=@_;
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my @err = ();
	my $apif = var("agave_client");
	my $apps = $apif->apps;

	my (@jobs, @step_form);
	my $wfid=$form->{_workflow_id}||=iPC::Utils::uuid();
  my $wf;
  try {
    my $wfjson=$form->{_workflow_json} || database->quick_select('workflow', {workflow_id => $form->{_derived_from}})->{json};
    $wf=from_json($wfjson);
  };
  delete $wf->{id};
  $wf->{name}=$form->{workflow_name} || 'workflow-' . $wfid . '-' . $wf->{name};
  $form->{workflow_desc} and $wf->{description}=$form->{workflow_desc};
  $wf->{derived_from}=$wf->{workflow_id};
  $wf->{workflow_id}=$wfid;
	foreach my $step (@{$wf->{steps}}) {
		my $app_id=$step->{appId};
		my ($app) = $apps->find_by_id($app_id);
		my ($job_id, $job_form)=prepareJob($username, $app, $form, $step, \@step_form, \@jobs);
		my $job={appId => $app_id, job_id => $job_id, archiveSystem => $archive_system, archivePath => $job_form->{archivePath}, status => 'PENDING'};
		if ($job_id) {
			push @jobs, $job;
			push @step_form, $job_form;
      $step->{jobId}=$job_id;
		}
	}
	try {
		database->quick_insert('workflow', {workflow_id => $wfid, json => to_json($wf), map {$_ => $wf->{$_}} qw(name description derived_from)});
		database->quick_insert('user_workflow', {workflow_id => $wfid, username => $username});
	} catch {
		my $old_wf=database->quick_select('workflow', {workflow_id => $wfid});
		$wf->{name}=$old_wf->{name};
		$wf->{description}=$old_wf->{description};
		database->quick_update('workflow', {workflow_id => $wfid}, {json => to_json($wf)});
	};
	scalar(@jobs) == scalar(@{$wf->{steps}}) ? +{status => 'success', data => {workflow_id => $wfid, jobs => \@jobs, workflow => $wf}} : undef;
}

swagger_path {
  parameters => [
    id => { in => 'path', required => 1, description => 'workflow id' },
  ],
  responses => {
    default => { description => 'run workflow by id' }
  },
},
get '/workflowJob/run/:id' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my $wfid=param("id");
  content_type 'application/json';
  my $result=runWorkflowJob($wfid, $username);
  $result ? to_json($result) : raise InvalidRequest => 'workflow not found';
};

sub runWorkflowJob {
  my ($wfid, $username)=@_;
	my @jobs;
	my $apif = var("agave_client");
	my $apps = $apif->apps;
	my $wf=database->quick_select('workflow', {workflow_id => $wfid});
	if ($wf) {
		my $wfObj=from_json($wf->{json});
		foreach my $step (@{$wfObj->{steps}}) {
			my $app_id=$step->{appId};
			my ($app) = $apps->find_by_id($app_id);
			my $job=database->quick_select('job', {job_id => $step->{jobId}});
			my $job_form=from_json($job->{job_json});
			my ($res, $err)=submitJob($username, $apif, $app, $job->{job_id}, $job_form);
			push @jobs, $job;
		}
	};

	$wf ? +{status => 'success', data => {workflow_id => $wfid, jobs => \@jobs}} : undef;
}

swagger_path {
  parameters => [
    id => {in => 'path', required => 1, description => 'app id'},
    paramsFromUser => 'params encoded in json',
  ],
  responses => {
    default => { description => 'run new job' }
  },
},
post '/job/new/:id' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my @err = ();
	my $app_id = param("id");
	my $apif = var("agave_client");

	my $apps = $apif->apps;

	my ($app) = $apps->find_by_id($app_id);
  my $form = params();
	my ($job_id, $job_form)=prepareJob($username, $app, $form);
	my ($job, $err)=submitJob($username, $apif, $app, $job_id, $job_form);
  content_type 'application/json';
	$job_id && $job && $job->{id} ? to_json({status => 'success', data => $job}) : raise InvalidRequest => 'job submission failed';
};

swagger_path {
  responses => {
    default => { description => 'get jobs' }
  },
},
get '/job' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my @result=database->quick_select('job', {username => $username}, {columns =>[qw/job_id agave_id app_id status agave_json/], order_by => {desc => 'id'}});
	foreach (@result) {
		if (my $json=delete $_->{agave_json}) {
			my $job=from_json($json);
      $_->{remoteSubmitted}=$job->{submitTime} || $job->{remoteSubmitted} || '';
      $_->{remoteEnded}=$job->{endTime} || $job->{remoteEnded} || '';
		}
	}
  content_type 'application/json';
	return to_json({status => 'success', data => \@result});
};

swagger_path {
  parameters => [
    id => {in => 'path', required => 1, description => 'job id'},
  ],
  responses => {
    default => { description => 'delete job by id' }
  },
},
get '/job/:id/delete' => sub {
	my $username=var("username") or raise InvalidCredentials => 'no username';
	my $job_id = param("id");
	if ($username eq setting("defaultUser")) {
		try {
			database->quick_delete('job', {job_id => $job_id, username => setting("defaultUser")});
		};
	} else {
		try {
			database->quick_update('job', {job_id => $job_id}, {username => setting("defaultUser")});
		} catch {
			my ($e)=@_;
			raise InvalidRequest => 'can not delete job';
		};
	}
  content_type 'application/json';
	to_json({status => 'success', data => {job_id => $job_id}}); 
};

get '/job/:id/stageJobOutputs' => sub {
	my $job_id=param("id");
	my $flag=param("stage");
	#my $username=$user->{username};
	my $job=database->quick_select('job', {job_id => $job_id});
	my $result=stageJobOutputs($job, $flag);
  content_type 'application/json';
	to_json({status => 'success', data => {job_id => $job_id, target => $result}});
};

sub prepareJob {
	my ($username, $app, $form, $step, $step_form, $prev_job)=@_;
	my $app_id=$app->{id};
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my $output_url=setting("output_url");
	my $irodsEnvFile=setting('irodsEnvFile');
	my $wf_step_prefix=setting("wf_step_prefix");
	my $step_prefix = defined $step ? $wf_step_prefix . $step->{id} . ':' : '';
	my $job_id=iPC::Utils::uuid();
	$archive_path=~s/__user__/$username/;

	$app or raise InvalidRequest => 'no apps found';

	my %job_form;
	foreach my $key (@{$app->inputs}, @{$app->parameters}) {
		my $name=$step_prefix ? $step_prefix . $key->{id} : $key->{id};
		$job_form{$name}=$form->{$name};
    if ($step_prefix) {
      defined $job_form{$name} or $job_form{$name}=$step->{inputs}{$key->{id}};
      defined $job_form{$name} or $job_form{$name}=$step->{parameters}{$key->{id}};
    }
    if (defined $key->{value}{default}) {
      ! defined $job_form{$name} || $job_form{$name} eq '' and $job_form{$name}=$key->{value}{default};
    }
	}

	$job_form{maxRunTime}||=$app->{defaultMaxRunTime} && iPC::Utils::cmp_maxRunTime($app->{defaultMaxRunTime}, setting("maxRunTime")) < 0 ? $app->{defaultMaxRunTime} : setting("maxRunTime");

	# hack for the url input
	foreach my $name (keys %job_form) {
		next unless $job_form{$name};
		if (ref($job_form{$name}) eq 'ARRAY') {
			foreach (@{$job_form{$name}}) {
				$_=iPC::Utils::transform_url($_, $archive_system);
			}
		} else {
			$job_form{$name}=iPC::Utils::transform_url($job_form{$name}, $archive_system)
		}
	}

	if ($step_prefix) {
		foreach my $name (keys %job_form) {
			my $n=$name;
			if ($n=~s/^$step_prefix//) {
				$job_form{$n}=delete $job_form{$name};
			}
		}

		foreach my $key (@{$app->inputs}) {
			my $k=$key->{id};
			if (defined $job_form{$k}) {
				my $fi=$job_form{$k};
				my $si=[];
				ref($fi) or $fi=[$fi];
				foreach my $i (0 .. $#$fi) {
          my ($prev_step_id, $prev_output_name);
          if (ref($fi->[$i]) eq 'HASH') {
            ($prev_step_id, $prev_output_name)=@{$fi->[$i]}{'step', 'output_name'};
          } elsif ($fi->[$i]=~m/^$wf_step_prefix([^:]+):(.*)$/) {
            ($prev_step_id, $prev_output_name)=($1, $2);
          }
          if (defined $prev_step_id && defined $prev_output_name) {
						$fi->[$i]=$prev_job->[$prev_step_id-1]{job_id} . ':' . $prev_output_name;
						push @$si, {step => $prev_step_id, output_name => $prev_output_name};
					} else {
						push @$si, $fi->[$i];
					}
				}
				if (1 == scalar(@$si)) {
					$job_form{$k}=$fi->[0];
					$step->{inputs}{$k}=$si->[0];
				} else {
					$job_form{$k}=$fi;
					$step->{inputs}{$k}=$si;
				}
			} else {
				exists $step->{inputs}{$k} and delete $step->{inputs}{$k};
			}
		}

		foreach my $key (@{$app->parameters}) {
			my $k=$key->{id};
			if (defined $job_form{$k}) {
				$step->{parameters}{$k}=$job_form{$k};
			} else {
				exists $step->{parameters}{$k} and delete $step->{parameters}{$k};
			}
		}
	}

	foreach my $group (qw/inputs parameters/) {
		foreach my $key ($app->$group) {
			next unless exists $job_form{$key->{id}};
			$job_form{$group}{$key->{id}}=delete $job_form{$key->{id}};
		}
	}

	my $host_url=request->uri_base;
	my $noteinfo='/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archiveSystem=${JOB_ARCHIVE_SYSTEM}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}';
	my $notepolicy={
		retryLimit => 100,
		saveOnFailure => 1,
		retryStrategy => "EXPONENTIAL"
	};
	my $notifications=[
	{
		event	=> "STAGED",
		url		=> $host_url . $noteinfo,
		policy => $notepolicy,
	},
	{
		event	=> "FINISHED",
		url		=> $host_url . $noteinfo,
		policy => $notepolicy,
	},
	{
		event	=> "RUNNING",
		url		=> $host_url . $noteinfo,
		policy => $notepolicy,
	},
	{
		event	=> "FAILED",
		url		=> $host_url . $noteinfo,
		policy => $notepolicy,
	},
	];

	$job_form{archive}='true';
	$job_form{archiveSystem}=$archive_system;
	$job_form{archivePath}=join('/', $archive_path, $app_id . '_' . $job_id);
  $job_form{notifications}=$notifications;

	my $cmd="export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;imkdir -p $archive_home/$job_form{archivePath}";
	try {
		system($cmd);
	} catch {
		error("Error: can not mkdir $archive_home/$job_form{archivePath}, @_");
	};

	$cmd="export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;ils -A $archive_home/$archive_path | grep ACL | grep $username";
	unless (scalar (`$cmd`)) {
		$cmd="export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;ichmod -r own $username $archive_home/$archive_path";
		system($cmd);
	}

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
			if ($v) {
				my $inputs=[];
				if (ref($v) eq 'HASH') {
					$inputs=[$v];
				} elsif (ref($v) eq 'ARRAY') {
					$inputs=$v;
				}
				foreach my $i (0 .. $#$inputs) {
					my $input=$inputs->[$i];
					if (defined $input && ref($input) eq 'HASH') {
						my $prev=$prev_job->[$input->{step}-1]{job_id};
						my $input_name=$#$inputs ? $job_form{inputs}{$k}[$i] : $job_form{inputs}{$k};
						my $row=database->quick_insert('nextstep', {prev => $prev, next => $job_id, input_name => $input_name});
					}
				}
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
	my $retry=setting('retry_num');
  my $retry_interval=setting('retry_interval');
	my $err;

	foreach my $key (@{$app->parameters}) {
    my $name=$key->{id};
    if (defined $job_form->{parameters}{$name}) {
      if ($key->{value}{type} && $key->{value}{type}=~/bool/i) {
        $job_form->{parameters}{$name}=$job_form->{parameters}{$name} == 0 || $job_form->{parameters}{$name} eq 'false' ? 'false' : 'true';
      } elsif ($key->{value}{type} && $key->{value}{type}=~/number/i) {
        $job_form->{parameters}{$name}+=0;
      }
    }
  }

	while ($retry-- >= 0) {
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
				$job->{job_id}=$job_id;
        $job->{remoteSubmitted}||=$job->{submitTime} || '';
        $job->{remoteStarted}||=$job->{startTime} || '';
        $job->{remoteEnded}||=$job->{endTime} || '';
				updateJob($job_id, $job);
				updateWorkflowJob($job_id);
        #$job_ep->share_job($job->{id}, $username, 'READ');
				return ($job);
			} else {
				$err='Error: ' . $st->{message};
				error($err);
			}
		}
		sleep($retry_interval) if $retry;
	}
	return (undef, $err);
}

sub updateJob {
	my ($job_id, $job)=@_;
	database->quick_update('job', {job_id => $job_id}, {agave_id => $job->{id}, agave_json => to_json($job), status => 'PENDING'});
}

sub updateWorkflowJob {
	my ($job_id)=@_;
	my $job=database->quick_select('job', {job_id => $job_id});
	if ($job && $job->{workflow_id}) {
		if (my $wf=database->quick_select('workflow', {workflow_id => $job->{workflow_id}})) {
			my $wfObj=from_json($wf->{json});
			my $changed;
			foreach my $step (@{$wfObj->{steps}}) {
				if ($step->{jobId} eq $job_id && $job->{agave_id}) {
					$step->{jobId}=$job->{agave_id};
					$changed=1;
				}
			}
			$changed && database->quick_update('workflow', {workflow_id => $job->{workflow_id}}, {json => to_json($wfObj)});
		}
	}
}

sub resubmitJob {
	my ($job_id)=@_;
	my $apif = var("agave_client");

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
		#submitNextJob($job);
		#archiveJob($job);
		#stageJobOutputs($job);
	} elsif ($params->{status} eq 'FAILED') {
		#resubmitJob($params->{id});
	} elsif ($params->{status} eq 'STAGED') {
		#submitQueuedJob($job);
	}
	return;
};
 
sub shareOutputByAgave {
	my ($job, $user)=@_;

	my $apif = var("agave_client");
	my $io = $apif->io;
	my $jobObj=from_json($job->{agave_json});
	my $path=$jobObj->{archivePath};
	my $res=$io->share($path, 'public', 'READ', 1);
}

sub shareOutput {
	my ($job)=@_;
	my $irodsEnvFile=setting('irodsEnvFile');
	my $archive_home=setting('archive_home');
	my $jobObj=from_json($job->{agave_json});
	my $path=$archive_home . '/' . $jobObj->{archivePath};
	my $cmd="export IRODS_ENVIRONMENT_FILE=$irodsEnvFile;ichmod -r read public $path;ichmod -r read anonymous $path";
	try {
		system($cmd);
	} catch {
		error("Error: can not share $path, @_");
	};
}

sub shareJob {
	my ($job)=@_;

	my $apif = var("agave_client");
	my $job_ep = $apif->job;
	my $res=$job_ep->share_job($job->{agave_id}, 'public', 'READ');
}

sub stageJobOutputs {
	my ($job, $flag)=@_;
	my @file_types=@{setting('stage_file_types') || []};
	#my $username=$job->{username};
	my $datastore=setting("datastore")->{__home__};
	my ($datastore_system, $datastore_home, $datastore_path)=($datastore->{system}, $datastore->{home}, $datastore->{path});
	my $visual=setting("datastore")->{__visual__};
	my ($visual_system, $visual_home, $visual_path)=($visual->{system}, $visual->{home}, $visual->{path});

	my $jobObj=from_json($job->{agave_json});
	my $target_path=(split /\//, $jobObj->{archivePath})[-1];
	my $outputs=$flag ? browse_ils($jobObj->{archivePath}, $datastore_system, $datastore_home) : undef;
	
	my $stage_files=[];
	my %stage_files_hash=();
	my @list;
	if ($flag) {
		my $stage_path=$visual_home . '/' . $visual_path . '/' . $target_path;
		try {
			-e $stage_path or mkdir $stage_path;
		} catch {
			my ($e)=@_;
			error("Error: $e");
			raise 'SystemError' => "mkdir failed";
		};

		$stage_files=browse_ls('', $visual_system, $stage_path, 1);
		%stage_files_hash=map { $_->{name} => 1 } @{$stage_files->[0]{list}};
		foreach my $item (@{$outputs->[0]{list}}) {
			my ($name,$path,$suffix) = fileparse($item->{name}, @file_types);
			if ($suffix) {
				my $stage_source=join('/', $datastore_home, $jobObj->{archivePath}, $item->{name});
				my $stage_target=$stage_path . '/' . $item->{name};
				if (! -e substr($stage_target, 0, -4) && ! -e $stage_target) {
					icommand('iget', '-f', $stage_source, $stage_target);
					-e $stage_target or error("Error: iget failed, $stage_target");
				}
				if (-e $stage_target && substr($stage_target, -4) eq '.tgz' && ! -e substr($stage_target, 0, -4)) {
					my $command="tar -xzf $stage_target -C $stage_path && rm $stage_target";
					try {
						system($command);
					} catch {
						my ($e)=@_;
						error("Error: $e");
					};
				}
				push @list, $item->{name};
			}
		}
	}
	return {system => $visual_system, path => $visual_path . '/' . $target_path, list => \@list};
}

sub archiveJob {
	my ($job)=@_;
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");

	my $apif = var("agave_client");
	my $io = $apif->io;
	my $jobObj=from_json($job->{agave_json});
	my $source=sprintf("https://agave.iplantc.org/files/v2/media/system/%s/%s", $jobObj->{executionSystem}, $jobObj->{outputPath});
	my $target=sprintf("/system/%s/%s", $archive_system, $archive_path);
	my $res=$io->import_file($target, {urlToIngest => $source});
}

sub submitQueuedJob {
	my ($prev_job)=@_;
	_updatePrevJob($prev_job);
	my @next_job=database->quick_select('job', {agave_id => undef}, {order_by => 'id'});
	foreach my $next_job (@next_job) {
		my $queue_length=setting('queue_length');
		my $job_count=database->quick_count('job', "agave_id is not null and status not in ('FINISHED', 'KILLED', 'FAILED', 'STOPPED', 'ARCHIVING_FAILED')");
		last if $job_count >= $queue_length;
		next if database->quick_count('nextstep', {next => $next_job->{job_id}, status => 0});
		_submitNextJob($next_job);
	}
}

sub _updatePrevJob {
	my ($prev_job)=@_;
	if ($prev_job->{status} eq 'FINISHED') {
		my $jobObj=from_json($prev_job->{agave_json});
		#my $source=sprintf("https://agave.iplantc.org/files/v2/media/system/%s/%s", $jobObj->{executionSystem}, $jobObj->{outputPath});
		#my $source=sprintf("https://agave.iplantc.org/jobs/v2/%s/outputs/media", $jobObj->{id});
		my $source=sprintf("agave://data.iplantcollaborative.org/%s", $jobObj->{archivePath});
		try{
			database->quick_update('nextstep', {prev => $prev_job->{job_id}}, {input_source => $source, status => 1});
		};
	}
}

sub _submitNextJob {
	my ($next_job)=@_;
	my $job_form=from_json($next_job->{job_json});
	my $user=_get_user($next_job->{username});
	my $apif = var("agave_client");
	my $apps = $apif->apps;
	my $job_ep = $apif->job;
	my @prev=database->quick_select('nextstep', {next => $next_job->{job_id}});
	my %input;
	my $count=0;
	foreach (@prev) {
		my $prev_job=database->quick_select('job', {job_id => $_->{prev}});
		my $prev_job_obj=from_json($prev_job->{agave_json});
		my $typePath='__home__/' . $prev_job_obj->{archivePath};
		my $prev_outputs=browse($typePath, $prev_job->{username}, 1);
		my (undef, $filename)=split /:/, $_->{input_name};
		foreach my $of (@{$prev_outputs->[0]{list}}) {
			if (substr($of->{name}, 0, length($filename)) eq $filename) {
				$filename=$of->{name};
				last;
			}
		}
		$input{$_->{input_name}}=$_->{input_source} . '/' . $filename;
	}
	while (my ($k, $v) = each %{$job_form->{inputs}}) {
		if (defined $v && exists $input{$v}) {
			$job_form->{inputs}{$k}=$input{$v};
			$count++;
		}
	}
	if ($count) {
		database->quick_update('job', {job_id => $next_job->{job_id}}, {job_json => to_json($job_form)});
		my ($app) = $apps->find_by_id($next_job->{app_id});
		my ($res, $err)=submitJob($next_job->{username}, $apif, $app, $next_job->{job_id}, $job_form);
	}
}

sub terminateNextJob {
	my ($prev)=@_;
	my @next=database->quick_select('nextstep', {prev => $prev->{job_id}, status => 0});
	if (scalar @next) {
		try {
			my $sth = database->prepare("update job set status = 'FAILED' where job_id = ?");
			foreach my $next (@next) {
				$sth->execute($next->{job_id});
			}
		};
		foreach my $next (@next) {
			terminateNextJob($next);
		}
	}
}

sub submitNextJob {
	my ($prev)=@_;

  my $apif = var("agave_client");
	my $apps = $apif->apps;
	my $job_ep = $apif->job;

	my $jobObj=from_json($prev->{agave_json});
	#my $source=sprintf("https://agave.iplantc.org/files/v2/media/system/%s/%s", $jobObj->{executionSystem}, $jobObj->{outputPath});
	#my $source=sprintf("https://agave.iplantc.org/jobs/v2/%s/outputs/media", $jobObj->{id});
	my $source=sprintf("agave://data.iplantcollaborative.org/%s", $jobObj->{archivePath});
	my @next=database->quick_select('nextstep', {prev => $prev->{job_id}, status => 0});
	if (scalar @next) {
		database->quick_update('nextstep', {prev => $prev->{job_id}}, {input_source => $source, status => 1});
	}

	foreach my $next (@next) {
		next if database->quick_count('nextstep', {next => $next->{next}, status => 0});
		my $next_job=database->quick_select('job', {job_id => $next->{next}});
		my $job_form=from_json($next_job->{job_json});
		my @prev=database->quick_select('nextstep', {next => $next_job->{job_id}});
		my %input;
		my $count=0;
		foreach (@prev) {
			my $prev_job=database->quick_select('job', {job_id => $_->{prev}});
			my $prev_job_obj=from_json($prev_job->{agave_json});
			my $typePath='__home__/' . $prev_job_obj->{archivePath};
			my $prev_outputs=browse($typePath, $prev_job->{username}, 1);
			#my $output_files=$job_ep->job_output_files($prev_job->{agave_id});
			my (undef, $filename)=split /:/, $_->{input_name};
			#foreach my $of (@$output_files) {
			foreach my $of (@{$prev_outputs->[0]{list}}) {
				if (substr($of->{name}, 0, length($filename)) eq $filename) {
					$filename=$of->{name};
					last;
				}
			}
			$input{$_->{input_name}}=$_->{input_source} . '/' . $filename;
		}
		while (my ($k, $v) = each %{$job_form->{inputs}}) {
			my $fi=$v;
			ref($fi) or $fi=[$fi];
			foreach (@$fi) {
				if (defined && exists $input{$_}) {
					$_=$input{$_};
					$count++;
				}
			}
			if (1 == scalar(@$fi)) {
				$job_form->{inputs}{$k}=$fi->[0];
			}
		}
		if ($count) {
			database->quick_update('job', {job_id => $next_job->{job_id}}, {job_json => to_json($job_form)});
			my ($app) = $apps->find_by_id($next_job->{app_id});

			my ($res, $err)=submitJob($next_job->{username}, $apif, $app, $next_job->{job_id}, $job_form);
		}
	}
}

true;
