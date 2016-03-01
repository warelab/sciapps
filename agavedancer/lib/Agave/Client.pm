package Agave::Client;

use warnings;
use strict;

=head1 NAME

Agave::Client - A Perl wrapper for Agave API!

=head1 VERSION

Version 0.02

=cut

our $VERSION = '0.3.0';

use base 'Agave::Client::Base';

use Agave::Client::IO ();
use Agave::Client::Apps ();
use Agave::Client::Auth ();
use Agave::Client::Job ();
use Agave::Client::Metadata ();

# Needed to emit the curl-compatible form when DEBUG is enabled
use URI::Escape;
# For handling the JSON that comes back from iPlant/Agave services
use JSON::XS ();

use Data::Dumper;

=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client;

    my $api = Agave::Client->new();
    ...

=head1 FUNCTIONS

=cut

my @config_files = qw(
   ./agave
   ~/.agave 
   ~/.agave/current
   ~/Library/Preferences/agave
   /etc/agave
);

=head2 new

=cut

sub new {

	my $proto = shift;
	my %args = @_;
	my $class = ref($proto) || $proto;

	my $self  = {
            hostname => delete $args{hostname} || 'agave.iplantc.org',
            iplanthome => '/iplant/home/',
            processors => 1,
            run_time => '01:00:00',
            apisecret => $args{apisecret} || '',
            apikey => $args{apikey} || '',
            user => $args{user} || delete $args{username} || '',
            password => $args{password} || '',
            token => $args{token} || '',
            credential_class => $args{credential_class} || 'self',
			#lifetime => defined $args{lifetime} ? delete $args{lifetime} : undef,
            http_timeout => defined $args{http_timeout} ? delete $args{http_timeout} : undef,
            auth => undef,
            debug => defined $args{debug} ? delete $args{debug} : undef,
            logger => defined $args{logger} ? delete $args{logger} : undef,
        };

    my $config_file = defined $args{config_file} ? delete $args{config_file} : undef;
    $self = _auto_config($self, $config_file) unless %args;

    if (defined $self->{username}) {
        $self->{user} = delete $self->{username};
    }
    if (defined $self->{access_token}) {
        $self->{token} = delete $self->{access_token};
    }

	if ( $self->{user} 
        && (
            ($self->{apikey} && $self->{apisecret}) 
            || ($self->{token} || $self->{password})
        )) 
    {
		_init_auth($self);
	}

    delete $self->{password};
	
	bless($self, $class);
	return $self;
}


sub _auto_config {
	
	# Try loading config from various paths
	# to populate user, password, token, host, processors, runtime, and so on

	my ($self, $config_file) = @_;
	
	my $json = JSON::XS->new->allow_nonref;	
	my $home_dir = File::HomeDir->home;

    my (@cfiles) = defined $config_file && -f $config_file 
                    ? ($config_file) 
                    : @config_files;

	foreach my $c (@cfiles) {
		if ($c =~ /^~/) {
			$c =~ s/^~/$home_dir/;
		}
		
		if (-f $c) {
			open(CONFIG, $c);
			my $contents = do { local $/;  <CONFIG> };
			if (defined($contents)) {
				my $mref = $json->decode( $contents );
				
				foreach my $option (keys %{ $mref }) {
					$self->{$option} = $mref->{$option};
				}
			}
			close CONFIG;
            last;
		}
	}
	
	return $self;

}


sub _init_auth {
	my ($self) = @_;
	
	my $auth = Agave::Client::Auth->new($self);
	if ($auth && $auth->token) {
		$self->{token} = $auth->token;
		$auth->debug($self->{debug});
	}
    else {
        delete $self->{token};
    }
	$self->{auth} = $auth;
}

sub auth {
	my ($self) = @_;
	return $self->{auth};
}

sub io {
	my $self = shift;
	return Agave::Client::IO->new($self);
}

sub apps {
	my $self = shift;
	return Agave::Client::Apps->new($self);
}

sub job {
	my $self = shift;
	return Agave::Client::Job->new($self);
}


sub meta {
	my $self = shift;
	return Agave::Client::Metadata->new($self);
}


sub token_expiration_in {
	my $self = shift;
	if ($self->{auth}) {
		return $self->{auth}->token_expiration_in;
	}
	return 0;
}

sub debug {
	my ($self, $d) = @_;
	if (defined $d) {
		$self->{auth} && $self->{auth}->debug($d);
	}
	$self->SUPER::debug($d);
}

sub logger {
	my ($self, $l) = @_;
	if (defined $l) {
		$self->{logger} = $l;
	}
	$self->{logger};
}

=head1 AUTHOR

Cornel Ghiban, C<< <cghiban at gmail.com> >>

=head1 BUGS



=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Agave::Client


You can also look for information at:

=over 4

http://agaveapi.co/

=back


=head1 ACKNOWLEDGEMENTS


=head1 COPYRIGHT & LICENSE

Copyright 2014 Cornel Ghiban.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut

1; # End of Agave::Client
