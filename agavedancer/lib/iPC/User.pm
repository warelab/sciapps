package iPC::User;

use strict;
use warnings;
use Dancer;
use Dancer::Plugin::Database;
use Data::Dumper; 

sub new {
	my ($class, $args) = @_;
	bless({
			username => $args->{username} || $args->{name},
			consumerKey => $args->{consumerKey},
			consumerSecret =>	$args->{consumerSecret},
			clientname => $args->{clientname},
			token	=> $args->{token},
			refresh_token => $args->{refresh_token},
			token_expires_at => $args->{token_expires_at},
		}, $class
	);
}

sub columns {
  return qw(username consumerKey consumerSecret clientname token refresh_token token_expires_at);
}

sub clone {
  my ($self)=@_;
  my $return={};
  foreach my $column ($self->columns) {
    $return->{$column}=$self->$column if defined $self->$column;
  }

  $return;
}

sub username {
	my ($self, $username)=@_;
	if ($username) {
		$self->{username}=$username;
	}
	$self->{username};
}

sub consumerKey {
	my ($self, $consumerKey)=@_;
	if ($consumerKey) {
		$self->{consumerKey}=$consumerKey;
	}
	$self->{consumerKey};
}

sub consumerSecret {
	my ($self, $consumerSecret)=@_;
	if ($consumerSecret) {
		$self->{consumerSecret}=$consumerSecret;
	}
	$self->{consumerSecret};
}

sub clientname {
	my ($self, $clientname)=@_;
	if ($clientname) {
		$self->{clientname}=$clientname;
	}
	$self->{clientname};
}

sub token {
	my ($self, $token)=@_;
	if ($token) {
		$self->{token}=$token;
	}
	$self->{token};
}
sub refresh_token {
	my ($self, $refresh_token)=@_;
	if ($refresh_token) {
		$self->{refresh_token}=$refresh_token;
	}
	$self->{refresh_token};
}

sub token_expires_at {
	my ($self, $token_expires_at)=@_;
	if ($token_expires_at) {
		$self->{token_expires_at}=$token_expires_at;
	}
	$self->{token_expires_at};
}

sub update {
	my ($self, $args)=@_;
  $args||={};
  my %data;
  foreach my $column ($self->columns) {
    next if $column eq 'username';
    $self->$column($args->{$column}) if defined $args->{$column};
    $data{$column}=$self->$column if defined $self->$column;
  }
	database->quick_update('agave_user', {username => $self->username}, \%data);
}

sub save {
	my ($self)=@_;
  my %data;
  foreach my $column ($self->columns) {
    $data{$column}=$self->$column if defined $self->$column;
  }
	database->quick_insert('agave_user', \%data);
}

sub search {
	my ($class, $args)=@_;
  my %data;
  foreach my $column ($class->columns) {
    $data{$column}=$args->{$column} if defined $args->{$column};
  }
	my $user=database->quick_select('agave_user', $args);
	$user ? $class->new($user) : undef;
}

1;
