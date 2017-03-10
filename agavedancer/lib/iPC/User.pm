package iPC::User;

use strict;
use warnings;
use Dancer;
use Dancer::Plugin::Database;

sub new {
	my ($class, $args) = @_;
	my $user=$class->search({username => $args->{name} || $args->{username}});
	$user ? bless({
			_username => $user->{username},
			_consumerSecret =>	$user->{consumer_secret}
		}, $class
	) : undef;
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
	database->quick_update('user', {username => $self->{_username}}, {consumer_secret => $self->{_consumerSecret}});
}

sub search {
	my ($class, $args)=@_;
	my $user=database->quick_select('user', $args);
}

1;
