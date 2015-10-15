package Agave::Client::Base;

use strict;
use warnings;

use base 'Agave::Client::Transport';


sub new {
	my ($proto, $args) = @_;
	my $class = ref($proto) || $proto;
	
	my $self  = { map {$_ => $args->{$_}} keys %$args};
	
	bless($self, $class);
	return $self;
}


sub user {
	my $self = shift;
	if (@_) { $self->{user} = shift }
	return $self->{user};
}

*username = \&user;

sub password {
	my $self = shift;
	if (@_) { $self->{password} = shift }
	return $self->{password};
}

sub token {
	my $self = shift;
	if (@_) { $self->{token} = shift }
	return $self->{token};
}

sub credential_class {
	my $self = shift;
	if (@_) { $self->{credential_class} = shift }
	return $self->{credential_class};
}

sub hostname {
	my $self = shift;
	if (@_) { $self->{hostname} = shift }
	return $self->{hostname};
}

sub processors {
	my $self = shift;
	if (@_) { $self->{processors} = shift }
	return $self->{processors};
}

sub run_time {
	my $self = shift;
	if (@_) { $self->{run_time} = shift }
	return $self->{run_time};
}

sub debug {
	my $self = shift;
	if (@_) { $self->{debug} = shift }
	return $self->{debug};
}


sub _error {
	my ($self, $msg, $data) = @_;

	{ status => 'error', message => $msg, data => $data }
}

1;
