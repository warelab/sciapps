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
			_consumerSecret =>	$args->{consumerSecret}
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

sub consumerSecret {
	my ($self, $consumerSecret)=@_;
	if ($consumerSecret) {
		$self->{_consumerSecret}=$consumerSecret;
	}
	$self->{_consumerSecret};
}

sub update {
	my ($self)=@_;
	database->quick_update('user', {username => $self->{_username}}, {consumerSecret => $self->{_consumer_secret}});
}

sub save {
	my ($self)=@_;
	database->quick_insert('user', {username => $self->{_username}, consumerSecret => $self->{_consumerSecret}});
}

sub search {
	my ($class, $args)=@_;
	my $user=database->quick_select('user', {username  => $args->{username} || $args->{name}});
	$user ? $class->new($user) : undef;
}

1;
