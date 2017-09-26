package iPC::User;

use strict;
use warnings;
use Dancer;
use Dancer::Plugin::Database;
use Data::Dumper; 

sub new {
	my ($class, $args) = @_;
	bless({
			_username => $args->{username} || $args->{name},
			_consumerKey => $args->{consumerKey},
			_consumerSecret =>	$args->{consumerSecret},
			_clientname => $args->{clientname},
			_token	=> $args->{token},
			_refresh_token => $args->{refresh_token},
			_token_expires_at => $args->{token_expires_at},
		}, $class
	);
}

sub username {
	my ($self, $username)=@_;
	if ($username) {
		$self->{_username}=$username;
	}
	$self->{_username};
}

sub consumerKey {
	my ($self, $consumerKey)=@_;
	if ($consumerKey) {
		$self->{_consumerKey}=$consumerKey;
	}
	$self->{_consumerKey};
}

sub consumerSecret {
	my ($self, $consumerSecret)=@_;
	if ($consumerSecret) {
		$self->{_consumerSecret}=$consumerSecret;
	}
	$self->{_consumerSecret};
}

sub clientname {
	my ($self, $clientname)=@_;
	if ($clientname) {
		$self->{_clientname}=$clientname;
	}
	$self->{_clientname};
}

sub token {
	my ($self, $token)=@_;
	if ($token) {
		$self->{_token}=$token;
	}
	$self->{_token};
}
sub refresh_token {
	my ($self, $refresh_token)=@_;
	if ($refresh_token) {
		$self->{_refresh_token}=$refresh_token;
	}
	$self->{_refresh_token};
}

sub token_expires_at {
	my ($self, $token_expires_at)=@_;
	if ($token_expires_at) {
		$self->{_token_expires_at}=$token_expires_at;
	}
	$self->{_token_expires_at};
}

sub update {
	my ($self)=@_;
	database->quick_update('agave_user', {username => $self->{_username}}, {consumerKey => $self->{_consumerKey}, consumerSecret => $self->{_consumerSecret}, clientname => $self->{_clientname}, token => $self->{_token}, refresh_token => $self->{_refresh_token}, token_expires_at => $self->{_token_expires_at}});
}

sub save {
	my ($self)=@_;
	database->quick_insert('agave_user', {username => $self->{_username}, consumerKey => $self->{_consumerKey}, consumerSecret => $self->{_consumerSecret}, clientname => $self->{_clientname}});
}

sub search {
	my ($class, $args)=@_;
	my $user=database->quick_select('agave_user', {username  => $args->{username} || $args->{name}});
	$user ? $class->new($user) : undef;
}

1;
