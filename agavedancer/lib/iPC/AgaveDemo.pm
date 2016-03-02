package iPC::AgaveDemo;
use Dancer ':syntax';

#use Dancer::Plugin::MemcachedFast;
use Agave::Client ();
use Agave::Client::Client ();
use Dancer::Plugin::Ajax;
use Dancer::Plugin::Email;
use File::Copy ();

our $VERSION = '0.2';
our @EXPORT_SETTINGS=qw/host_url archive_system archive_path archive_home input_system input_path input_home output_url email upload_suffix datastore_system/;

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
    });

    my $client_name = 'AGAVEWEB';
	$apic->client($client_name) || $apic->create({name => $client_name});
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
		)};

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

#get '/' => sub {
#	send_file 'index.html';
#};

get '/' => sub {
	my $app_id = param("app_id");

	template 'index', {
		app_id => $app_id,
	};
};

get '/logout' => sub {
	session 'token' => '';
	session 'logged_in' => 0;

	return redirect '/';
};

ajax '/settings' => sub {
	my $settings={map {$_ => setting($_)} @EXPORT_SETTINGS};
	to_json($settings);
};

ajax qr{/browse/?(.*)} => sub {
	check_login();

	my $username = session('username');
	my $apif = Agave::Client->new(
		username => $username,
		token => session('token'),
	);

	my ($path) = splat;
	my $system;
	if ($path=~m#system/([^\/]+)/(.*)#) {
		$system=$1;
		$path=$2;
	} else {
		$system=setting('datastore_system');
	}
	$system='system/' . $system . '/';

	my $path_to_read = $path ? $path : '';
	#$path_to_read=~s/^\///;
	#unless (substr($path_to_read,-1,1) eq '/') {
	#	$path_to_read.="/";
	#}
	my $io = $apif->io;
	my $dir_list = $io->readdir('/' . $system . $path_to_read);
	to_json({
			#root => $username,
			root => '',
			path => $path_to_read,
			list => $dir_list,
		}
	);
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
	#print STDERR to_dumper($app_list);
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
	#print STDERR to_dumper($app);
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
	my $job;
	my $retry=2;
	do {
		$job = eval { $job_ep->job_details($job_id) };
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
	my $st = $job_ep->delete_job($job_id);

	return redirect '/apps';
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
	my ($inputs, $parameters) = ([], []);
	if ($app) {
		$inputs = $app->inputs;
		$parameters = $app->parameters;
	}
	my $form = params();
	my $st=submitJob($apif, $app, $app_id, $form, $inputs, $parameters);
	#print STDERR to_dumper( $st ), $/;
	if ($st) {
		if ($st->{status} eq 'success') {
			my $job = $st->{data};
			return redirect '/job/' . $job->{id};
		}
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
	#print STDERR to_dumper($app) . "\n";

	my ($inputs, $parameters) = ([], []);
	if ($app) {
		$inputs = $app->inputs;
		$parameters = $app->parameters;
	}

	my $form = params();
	if ( request->method() eq "POST" ) {
		my $st=submitJob($apif, $app, $app_id, $form, $inputs, $parameters);
		#print STDERR to_dumper( $st ), $/;
		if ($st) {
			if ($st->{status} eq 'success') {
				my $job = $st->{data};
				return redirect '/job/' . $job->{id};
			}
			else {
				push @err, $st->{message};
			}
		}
	}
 	template 'job_new', {
		errors => \@err,
 		app => $app,
		app_inputs => $inputs,
		app_params => $parameters,
		name => $app_id,
		#genomes => $genomes,
		username => $username,
		form => $form,
	};
};

sub submitJob {
	my ($apif, $app, $app_id, $form, $inputs, $parameters)=@_;
	my $archive_system=setting("archive_system");
	my $archive_home=setting("archive_home");
	my $archive_path=setting("archive_path");
	my $input_system=setting("input_system");
	my $input_home=setting("input_home");
	my $input_path=setting("input_path");
	my $output_url=setting("output_url");

	$form->{maxRunTime}||=$app->{defaultMaxRunTime} && cmp_maxRunTime($app->{defaultMaxRunTime}, setting("maxRunTime")) < 0 ? $app->{defaultMaxRunTime} : setting("maxRunTime");
	#$form->{nodeCount}||=setting("nodeCount");

	# hack for the url input
	foreach my $input (@$inputs) {
		if ($form->{$input->{id}}=~m#^http://data.maizecode.org#) {
			$form->{$input->{id}}=~s#^http://data.maizecode.org#agave://$archive_system/data#;
		} elsif ($form->{$input->{id}}=~m#^http://www.maizecode.org#) {
			$form->{$input->{id}}=~s#^http://www.maizecode.org#agave://$archive_system#;
		} else {
			$form->{$input->{id}}=~s#^$output_url#agave://$archive_system#;
		}
	}

	# TODO - check arguments

	my $io=$apif->io;
	#my $tempname=tempname();
	my $tempdir=$input_path . "/" . tempname();
	my $tempdir_abs=$input_home . '/' . $tempdir;
	mkdir($tempdir_abs);
	chmod(0775, $tempdir_abs);
	my $upload_suffix=quotemeta(setting("upload_suffix"));
	eval {
		foreach my $upload (keys %{request->uploads()}) {
			my $file=request->upload($upload);
			my $source=$file->tempname;
			my $target_abs=$tempdir_abs . "/" . $file->filename;
			my $target=$tempdir . "/" . $file->filename;
			File::Copy::copy($source, $target_abs) or die "Copy failed: $!";
			my $input="agave://" . $input_system . "/" . $target;
			delete $form->{$upload};
			$upload=~s/$upload_suffix$//;
			$form->{$upload}=$input;
		}
	};
	if ($@) {
		print STDERR 'Error: ', $@, $/;
	}

	my ($result_folder)=map {s/\W+/-/g;lc() . "-" . tempname() } ($app_id);
	$archive_path.= "/" . $result_folder;
	my $archive_path_abs=$archive_home . "/" . $archive_path;
	mkdir($archive_path_abs);
	chmod(0775, $archive_path_abs);
	open FH, ">", "$archive_path_abs/.htaccess" or print STDERR "Error: can't open  ${archive_path_abs}/.htaccess\n";
	print FH "DirectoryIndex ../.index.php?dir=$result_folder\n";
	close FH;

	my $notifications;
	my $host_url=setting("host_url");
	if (my $email = delete $form->{"_email"}) {
		session(_email => $email);
		open FH, ">", "$archive_path_abs/.email" or print STDERR "Error: can't open  ${archive_path}/.email\n";
		print FH "$email";
		close FH;
		$notifications=[
		{
			event	=> "FINISHED",
			url		=> $host_url . '/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}',
		},
		{
			event	=> "FAILED",
			url		=> $host_url . '/notification/${JOB_ID}?status=${JOB_STATUS}&name=${JOB_NAME}&startTime=${JOB_START_TIME}&endTime=${JOB_END_TIME}&submitTime=${JOB_SUBMIT_TIME}&archivePath=${JOB_ARCHIVE_PATH}&message=${JOB_ERROR}',
		},
		];
	}

	%$form=(%$form,
		archive => 'true',
		archiveSystem => $archive_system,
		archivePath	=> $archive_path,
		notifications	=> $notifications,
	);
	#print STDERR to_dumper($form) . "\n";
		
	my $job_ep = $apif->job;
	my $st = eval { $job_ep->submit_job($app, %$form); };
	#print STDERR to_dumper($st) . "\n";
	if ($@) {
		print STDERR 'Error: ', $@, $/;
	}
	$st;
}

any ['get', 'post'] => '/notification/:id' => sub {
	my $params=params;
	#my ($id, $name, $status, $start, $end, $submit, $path, $message)=@$params{qw/id name status startTime endTime submitTime path message/};
	
	if ( $params->{status} eq 'FINISHED' || $params->{status} eq 'FAILED' ) {
		my $path=setting("archive_home") . '/' . $params->{archivePath};
		#print STDERR to_dumper($params) . "\n";
		if (-r $path . "/.email") {
			open(EMAIL, $path . "/.email");
			my $email=do { local $/;  <EMAIL> };
			close EMAIL;
			my $template_engine = engine 'template';
			my $content=$template_engine->apply_renderer('job', {job => $params}); 
			#my $content=template 'job', {job => $params};
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
	return;
};

true;
