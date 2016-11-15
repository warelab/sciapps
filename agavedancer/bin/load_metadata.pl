#!/usr/bin/env perl
use FindBin qw($Bin);
use lib "$Bin/../lib";
use Agave::Client ();
use Agave::Client::Client ();
use Agave::Client::Exceptions ();
use Try::Tiny;
use JSON;

my %session;

sub token_valid {
	my $tk_expiration = $session{token_expiration_at};
	# if we don't have an expiration token
	return 0 unless $tk_expiration;
	
	my $now = time();
	if ($tk_expiration < $now) {
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

sub _auth {
	open(AGAVE, "$BIN/.agave"));
	my $contents = do { local $/;  <AGAVE> };
	close AGAVE;
	my $agave=decode_json($contents);

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
		$session{username}=$api->{'user'};
		$session{token}=$api->token;
		$session{token_expiration_in} = $api->auth->token_expiration_in;
		$session{token_expiration_at} = $api->auth->token_expiration_at;
	}
}

sub check_login {
	unless(token_valid()) {
		auto_login();
	}
}

sub getAgaveClient {
	check_login();

	my $username = $session{username};
	Agave::Client->new(
		username => $username,
		token => $session{token},
	);
}


1;
