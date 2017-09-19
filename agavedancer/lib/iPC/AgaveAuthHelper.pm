package iPC::AgaveAuthHelper;

use strict;
use warnings;

use Agave::Client ();
use Agave::Client::Client ();
use iPC::User ();
use iPC::Utils (); 
use Data::Dumper; 

{
	sub new {
		my ($class, $args) = @_;

		my ($apio, $username, $password);
		if (defined $args && 'HASH' eq ref($args)) {
			$apio = delete $$args{apio};
			$username = $$args{username};
			$password = $$args{password};
		}

		unless ($apio && ref($apio) eq 'Agave::Client') {
			$apio=undef;
		}

		my $self=bless {
			_api => $apio && ref($apio) eq 'Agave::Client' ? $apio : undef,
			_username => $username,
			_debug => $args->{debug},
		}, $class;

		if ($username && $password && ! $self->api) {
			if (my $api=$self->_init_auth($args)) {
				$self->api($api);
				$self->_store_agave_auth;
			}
		}

		$self;
	}

	sub _init_auth {
		my ($self, $args) = @_;

		my ($apio, $username, $password, $client);
		if (defined $args && 'HASH' eq ref($args)) {
			$username = $$args{username};
			$password = $$args{password};
		}

		if ($username and my $user = iPC::User->search({username => $username})) {
			$args->{apikey} = $user->consumerKey;
			$args->{apisecret} = $user->consumerSecret;
		}

		if ($username && $password) {
			my ($consumerKey, $consumerSecret)=($args->{apikey}, $args->{apisecret});
			unless ($consumerKey && $consumerSecret) {
				$client = eval{_build_client($username, $password);};
				($consumerKey, $consumerSecret)=($client->{consumerKey}, $client->{consumerSecret});
			}
			if ($consumerKey && $consumerSecret) {
				$apio = eval {
					Agave::Client->new(
						username  => $username,
						password  => $password,
						apikey    => $consumerKey,
						apisecret => $consumerSecret,
						debug     => $args->{debug},
					)
				};
				if ($@ =~ /unauthorized/i && $password ne '') {
					# recreate $client_name client
					$client = _build_client($username, $password, 'purge');
					($consumerKey, $consumerSecret)=($client->{consumerKey}, $client->{consumerSecret});
					$apio = eval {
						Agave::Client->new(
							username  => $username,
							password  => $password,
							apikey    => $consumerKey,
							apisecret => $consumerSecret,
							debug     => $args->{debug},
						)
					};
					print STDERR '2nd try failed: ', $@, $/ if $@;
				}
			}
		}
		$apio;
	}

	sub refresh {
		my ($self, $refresh_token) = @_;
		my $token;
		if (my $auth=$self->api && $self->api->auth) {
			$token=$auth->refresh($refresh_token);
			$self->_store_agave_auth;
		}
		$token;
	}

	sub _store_agave_auth {
		my ($self)=shift;
		my $username=$self->username;
		my $api=$self->api;
		if (my $user=iPC::User->search({username => $self->{_username}}) and $api and my $auth=$api->auth) {
			$user->token($auth->{access_token});
			$user->refresh_token($auth->{refresh_token});
			$user->token_expires_at=(time() + $auth->{refresh_expires_in});
			$user->update;
		}
	}

	sub api {
		my ($self, $apio) = @_;
		return unless ref($self);
		if ($apio and ref($apio)) {
			$self->{_api} = $apio;
		}
		return $self->{_api};
	}

	sub username {
		my ($self) = @_;
		return $self->{_username};
	}

	sub _build_client {
		my ($u, $p, $purge) = @_;

		my $client;

		# check if we have an Agave client already
		my $apic = Agave::Client::Client->new({ 
			username => $u, 
			password => $p, 
			debug => 0,
		});	
		my $user = iPC::User->search({username => $u});
		
		my $client_name=$user && $user->clientname ? $user->clientname : '_SciApps' . '_' . iPC::Utils::tempname();
		$client = $apic->client($client_name);

		if ($purge || ! $user || ! $user->consumerKey || ! $user->consumerSecret) {
			print STDERR '** ', __PACKAGE__, ' purging client ', 
				$client_name, ' for user ', $u, $/;
			eval {$apic->delete($client_name);};
			print STDERR  '** ', __PACKAGE__, ' deleting: ', $@, $/ if $@;
			$client=undef;
		}

		unless ($client) {
			$client = $apic->create({name => $client_name});
			if ($client) {
				# store the secret;
				if ($user) {
					$user->consumerKey( $client->{consumerKey} );
					$user->consumerSecret( $client->{consumerSecret} );
					$user->update;
				} else {
					$user=iPC::User->new({username => $u, consumerKey => $client->{consumerKey}, consumerSecret => $client->{consumerSecret}, clientname => $client_name});
					$user->save;
				}
			}
		}

		return $client;
	}

	sub debug {
		my ($self, $d) = @_;
		return unless ref($self);
		if (defined $d) {
			$self->{_debug} = $d;
		}
		return $self->{_debug};
	}
}

1;

__END__

package main;
use Data::Dumper; 

my $ah = AgaveAuthHelper->new({
		username => '$username',
		password => '$password'
	});

print $ah, $/;
print $ah->api, $/;
print $ah->api->auth, $/;
print $ah->api->token, $/;
print Dumper($ah->client), $/;
