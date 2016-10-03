package iPC::AgaveDemo;
use Dancer ':syntax';

#use Dancer::Plugin::MemcachedFast;
use Agave::Client ();
use Agave::Client::Client ();
use Dancer::Plugin::Ajax;
use Dancer::Plugin::Email;
use Dancer::Plugin::Database;
use File::Copy ();
use Archive::Tar ();
use FindBin;

our $VERSION = '0.2';
our @EXPORT_SETTINGS=qw/host_url output_url upload_suffix wf_step_prefix datastore_system archive_home/;

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

# TODO - this needs work
sub token_valid {
	my $tk_expiration = session('token_expiration_at');
	# if we don't have an expiration token
	return 0 unless $tk_expiration;
	
	my $now = time();
    if ($tk_expiration < $now) {
        session 'logged_in' => undef;
        return 0;
    }
	return 1;
}

sub _build_client {
	my ($u, $p)=@_;
	my $apic = Agave::Client::Client->new({
			username => $u,
			password => $p,
		}
	);

	my $client_name = 'AGAVEWEB';
	$apic->client($client_name) || $apic->create({name => $client_name});
}

sub __build_client {
	my ($u, $p, $purge)=@_;
	my $client;
	my $apic = Agave::Client::Client->new({
			username => $u,
			password => $p,
		}
	);

	my $client_name = '_AGAVEWEB';
	my $user;
	if ($purge) {
		print STDERR '** purging client ', $client_name, ' for user ', $u, "\n";
		eval {$apic->delete($client_name)};
		print STDERR  '** deleting: ', $@, "\n" if $@;
	} else {
		$client=$apic->client($client_name);
	}
	if ($client) {
		$client->{consumerSecret} = $user->consumerSecret;
	} else {
		$client=$apic->create({name => $client_name});
		$user->consumerSecret( $client->{consumerSecret} );
		$user->update;
	}
	return $client;
}

sub _auth {
	open(AGAVE, setting("appdir") . "/" . setting("agave_config"));
	my $contents = do { local $/;  <AGAVE> };
	close AGAVE;
	my $agave=from_json($contents);

	my $client = _build_client($agave->{username}, $agave->{password});
	my $apio = eval {
		Agave::Client->new(
			username  => $agave->{username},
			password  => $agave->{password},
			apisecret => $agave->{consumerSecret},
			apikey    => $client->{consumerKey},
		)
	};
	if ($@) {
		print STDERR 'auth failed: ', $@, $/;
	}
	return $apio;
}

sub auto_login {
	my $err = "";
	my $api = eval {_auth()};
	if ($@) {
    	print STDERR  "Error: ", $@, $/;
	}

	if ($api && $api->token) {
    	debug "Token: " . $api->token . "\n";
    	session 'username' => $api->{'user'};
    	session 'token' => $api->token;
    	session 'logged_in' => 1;
    	session 'token_expiration_in' => $api->auth->token_expiration_in;
    	session 'token_expiration_at' => $api->auth->token_expiration_at;
	
		print STDERR "Delta: ", $api->auth->token_expiration_in, $/;
	}
	else {
		$err .= "Invalid credentials."
	}
}

sub check_login {
	unless(session('logged_in') && token_valid()) {
		auto_login();
	}
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
	s/://g foreach @_;
	$_[0] <=> $_[1];
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

sub parse_ls {
	my ($ls, $file_root)=@_;
	my $regex=qr#^$file_root/(.*):#;
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

hook 'after' => sub {
	my $response = shift;
	$response->header('Access-Control-Allow-Origin' => '*');
};

get '/' => sub {
	my $app_id = param("app_id");
	my $page_id = param("page_id");
	my $wf_id = param("wf_id");
	my $setting={map {$_ => setting($_)} @EXPORT_SETTINGS};

	template 'index', {
		app_id => $app_id,
		page_id => $page_id,
		wf_id	=> $wf_id,
		setting => $setting,
	};
};

get '/logout' => sub {
	session 'token' => '';
	session 'logged_in' => 0;

	return redirect '/';
};

#ajax '/settings' => sub {
#	my $settings={map {$_ => setting($_)} @EXPORT_SETTINGS};
#	to_json($settings);
#};

sub browse_datastore {
	my ($path, $system)=@_;
	$system||=setting('datastore_system');

	check_login();

	my $username = session('username');
	my $apif = Agave::Client->new(
		username => $username,
		token => session('token'),
	);

	#my $root=$username;
	my $root='';
	my $path_to_read = $path ? $path : $root;
	$system='system/' . $system . '/';

	my $io = $apif->io;
	my $dir_list = $io->readdir('/' . $system . $path_to_read);

	to_json([{
			is_root => $path_to_read eq $root ? 1 : 0,
			path => $path_to_read,
			list => $dir_list,
		}]
	);
}

sub browse_server {
	my ($path)=@_;
	my $server=setting("file_server");
	my $file_root=setting("file_root");
	my $file_user=setting("file_user");
	my $bin=$FindBin::Bin;

	my $root='';
	my $path_to_read = $path ? $path : $root;

	my @ls=`sudo -u $file_user $bin/files-list.sh $server $file_root $path_to_read`;
	my $dir_list=parse_ls(\@ls, $file_root);

	to_json([map +{
			is_root => $_ eq $root ? 1 : 0,
			path => $_,
			list => $dir_list->{$_},
		}, keys %$dir_list]
	);
}

ajax qr{/browse/?(.*)} => sub {
	my ($path) = splat;
	my $use_file_server=setting('use_file_server');
	my $system;
	if ($path=~m#system/([^\/]+)/(.*)#) {
		$system=$1;
		$path=$2;
		$use_file_server=0;
	}
	$use_file_server ? browse_server($path) : browse_datastore($path, $system);
};

ajax '/apps' => sub {
	my $app_list=retrieveApps();
	to_json($app_list);
};


get qr{/apps/?} => sub {
	my $app_list=retrieveApps();

 	template 'apps', {
 		list => $app_list,
	};
};

sub retrieveApps {
	check_login();

	my $username = session('username');
	my $apif = Agave::Client->new(
		username => $username,
		token => session('token'),
	);

	my $apps = $apif->apps;
	my $app_list = [grep { ! $_->{isPublic} } ($apps->list)];
	return $app_list;
}

ajax '/app/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApp($app_id);
	to_json($app)
};

get '/app/:id' => sub {
	my $app_id = param("id");
	my $app=retrieveApp($app_id);
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

sub retrieveApp {
	my ($app_id)=@_;
	check_login();
	my $username = session('username');
	my $api = Agave::Client->new(
		user => $username,
		token => session('token'),
	);

	my $apps = $api->apps;
	my ($app) = $apps->find_by_id($app_id); 
	return $app;
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

ajax '/job/:id' => sub {
	my $job_id = param("id");

	my $job=retrieveJob($job_id);
	$job->{job_id}=$job_id;
	return to_json($job);
};

get '/job/:id' => sub {
	my $job_id = param("id");

	my $job=retrieveJob($job_id);
	if ($job) {
		return template 'job', {
			job => $job,
			job_id => $job_id,
		};
	}
};

sub retrieveJob {
	my ($job_id)=@_;

	check_login();

	my $username = session('username');
	my $apif = Agave::Client->new(
		username => $username,
		token => session('token'),
	);

	my $job_ep = $apif->job;
	my $row = database->quick_select('job', {job_id => $job_id});
	my $agave_id=$row ? $row->{'agave_id'} : $job_id;
	my $job;
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
	return $job;
}

get '/job/:id/remove' => sub {
	check_login();

	my $job_id = param("id");
	my $username = session('username');
	my $apif = Agave::Client->new(
		username => $username,
		token => session('token'),
	);

	my $job_ep = $apif->job;
	my $row = database->quick_select('job', {job_id => $job_id});
	my $st = $job_ep->delete_job($row->{'agave_id'});

	return redirect '/apps';
};

ajax '/workflow/new' => sub {
	check_login();

	my @err = ();
	my $app_id = param("id");
	my $username = session('username');
	my $apif = Agave::Client->new(
		user => $username,
		token => session('token'),
	);
	my $apps = $apif->apps;

	my (@jobs, @step_form);
	my $form = params();
	my $wf=from_json($form->{'_workflow_json'});
	foreach my $step (@{$wf->{'steps'}}) {
		my $app_id=$step->{appId};
		my ($app) = $apps->find_by_id($app_id);
		my ($job_id, $job_form)=prepareJob($app, $form, $step, \@step_form, \@jobs);
		my ($job, $err)=submitJob($apif, $app, $job_id, $job_form);
		if ($job_id) {
			push @jobs, {appId => $app_id, job_id => $job_id};
			push @step_form, $job_form;
		}
	}
	return to_json(\@jobs);
};

ajax '/job/new/:id' => sub {
	check_login();

	my @err = ();
	my $app_id = param("id");
	my $username = session('username');
	my $apif = Agave::Client->new(
		user => $username,
		token => session('token'),
	);

	my $apps = $apif->apps;

	my ($app) = $apps->find_by_id($app_id);
	my $form = params();
	my ($job_id, $job_form)=prepareJob($app, $form);
	my ($job, $err)=submitJob($apif, $app, $job_id, $job_form);
	if ($job_id && $job && $job->{id}) {
		return redirect '/job/' . $job_id;
	}
};

any ['get', 'post'] => '/job/new/:id' => sub {
	check_login();

	my @err = ();
	my $app_id = param("id");
	my $username = session('username');
	my $apif = Agave::Client->new(
		user => $username,
		token => session('token'),
	);

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
		username => $username,
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

	while (my ($k, $v)=each %{$step->{inputs}}) {
		if ($v) {
			my $sf=$step_form->[$v->{step}];
			$job_form{$k}='agave://' . $input_system . '/' . $sf->{archivePath} . '/' . $v->{output_name};
		}
	}

	my ($result_folder)=map {my $t=$_; $t=~s/\W+/-/g; lc($t) . "-" . tempname()} ($app_id);
	$archive_path.= "/" . $result_folder;
	my $archive_path_abs=$archive_home . "/" . $archive_path;
	mkdir($archive_path_abs);
	chmod(0775, $archive_path_abs);
	open FH, ">", "$archive_path_abs/.htaccess" or print STDERR "Error: can't open  ${archive_path_abs}/.htaccess\n";
	print FH "DirectoryIndex ../.index.php?dir=$result_folder\n";
	close FH;

	my $host_url=setting("host_url");
	my $noteinfo='/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}';
	my $notifications=[
	{
		event	=> "FINISHED",
		url		=> $host_url . $noteinfo,
		},
	{
		event	=> "FAILED",
		url		=> $host_url . $noteinfo,
	},
	];
	if (my $email = $form->{"_email"}) {
		open FH, ">", "$archive_path_abs/.email" or print STDERR "Error: can't open  ${archive_path}/.email\n";
		print FH $email;
		close FH;
	}

	$job_form{archive}=1;
	$job_form{archiveSystem}=$archive_system;
	$job_form{archivePath}=$archive_path;
	$job_form{notifications}=$notifications;

	my $job_id=uuid();
	my $job_json=to_json(\%job_form);
	eval {
		database->quick_insert('job', {job_id => $job_id, app_id => $app_id, job_json => $job_json});
		while (my ($k, $v)=each %{$step->{inputs}}) {
			if ($v) {
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
	#print STDERR to_dumper($job_form) . "\n";
	
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
			database->quick_update('job', {job_id => $job_id}, {agave_id => $job->{id}});
			return ($job);
		} else {
			print STDERR 'Error: ', $st->{message}, $/;
			return (undef, $st->{message});
		}
	}
	return;
}

any ['get', 'post'] => '/notification/:id' => sub {
	my $params=params;
	
	if ($params->{status} eq 'FINISHED' || $params->{status} eq 'FAILED') {
		next if $params->{message}=~/Attempt [12] to submit job/;
		my $path=setting("archive_home") . '/' . $params->{archivePath};
		if (-r $path . "/.email") {
			open(EMAIL, $path . "/.email");
			my $email=do { local $/;  <EMAIL> };
			close EMAIL;
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
		if ($params->{status} eq 'FINISHED') {
			submitNextJob($params);
			uncompress_result($params->{archivePath});
		}
	}
	return;
};

sub submitNextJob {
	my ($params)=@_;

	check_login();

	my $username = session('username');
	my $apif = Agave::Client->new(
		user => $username,
		token => session('token'),
	);
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
