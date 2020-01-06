package iPC::AgaveAuthHelper;

use strict;
use warnings;

use Agave::Client ();
use Agave::Client::Client ();
use iPC::User ();
use iPC::Utils (); 
use Data::Dumper; 

{
	# this might be a bit heavy
	# TODO split this in two: new() and auth()
	sub new {
		my ($class, $args ) = @_;

		my ($apio, $username, $password, $client);
		if (defined $args && 'HASH' eq ref($args)) {
			$apio = $$args{apio};
			$username = $$args{username};
			$password = $$args{password};
		}

		if ($apio && ref($apio) ne 'Agave::Client') {
			return;
		}

		if ($username ne '' && $password ne '') {
			$client = eval{_build_client($username, $password);};
			if ($client) {
				$apio = eval {
						Agave::Client->new(
							username  => $username,
							password  => $password,
							apisecret => $client->{consumerSecret},
							apikey    => $client->{consumerKey},
							debug     => $args->{debug},
						)};
				if ($@ =~ /unauthorized/i) {
					# recreate $client_name client
					$client = _build_client($username, $password, 'purge');
					$apio = eval {
							Agave::Client->new(
								username  => $username,
								password  => $password,
								apisecret => $client->{consumerSecret},
								apikey    => $client->{consumerKey},
								debug     => $args->{debug},
							)};
					print STDERR '2nd try failed: ', $@, $/ if $@;

				}
			}
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
			$user->token_expires_at($auth->{token_expires_at});
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

	sub client {
		my ($self) = @_;

		return $self->{_client};
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

		if ($purge || ! $user || ! $user->consumerSecret) {
			print STDERR '** ', __PACKAGE__, ' purging client ', 
				$client_name, ' for user ', $u, $/;
			eval {$apic->delete($client_name);};
			print STDERR  '** ', __PACKAGE__, ' deleting: ', $@, $/ if $@;
		} else {
			$client = $apic->client( $client_name );
		}

		if ($client) {
			$client->{consumerSecret} = $user->consumerSecret;
		} else{
			$client = $apic->create({name => $client_name});
			if ($client) {
				# store the secret;
				if ($user) {
					$user->consumerSecret( $client->{consumerSecret} );
					$user->update;
				} else {
					$user=iPC::User->new({username => $u, consumerSecret => $client->{consumerSecret}, clientname => $client_name});
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
