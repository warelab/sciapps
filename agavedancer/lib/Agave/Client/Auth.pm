package Agave::Client::Auth;

use warnings;
use strict;

use base 'Agave::Client::Base';
use URI::Encode ();
use MIME::Base64;
use Try::Tiny;
use Data::Dumper;

=head1 NAME

Agave::Client::Auth - The great new Agave::Client::Auth!

=head1 VERSION

Version 0.3.0

=cut

our $VERSION = '0.3.0';

my $TRANSPORT = 'https';


=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client::Auth;

    my $foo = Agave::Client::Auth->new();
    ...

=head1 FUNCTIONS

=head2 new

=cut

sub new {
	my ($proto, $args) = @_;
	my $class = ref($proto) || $proto;
	
	my $self  = { map {$_ => $args->{$_}} grep {/^(?:user|token|password|hostname|apisecret|apikey|refresh_token|http_timeout|client|debug)$/} keys %$args};
	
	bless($self, $class);

	if ($self->{user} && $self->{token}) {
		#unless ($self->is_token_valid) {
		#    # we should catch this and switch to password authentication
		#    # will try to get a new token, if the password was provided
		#    delete $self->{token};
		#}
		#else {
		#	print STDERR  "Token validated successfully", $/ if $self->debug;
		#}
	}


    # if client specified..
    if ($self->{client}) {
        #my $client = 1;
        # get client, apikey
    }


	if ($self->{user} && $self->{apikey} && $self->{apisecret} && !$self->{token}) {
		# hit auth service for a new token
		my $newToken = $self->_auth_post_token();
		print STDERR "Issued-Token: ", $newToken, "\n" if $self->debug;
		$self->{token} = $newToken;
	}
	delete $self->{password};

	return $self;
}

# issue new token
# curl -sk -X POST \
#	-d "grant_type=password&username=nryan@mlb.com&password=<password>&scope=PRODUCTION" \
#	-u "$CLIENT_KEY:$CLIENT_SECRET"  \
#	-H "Content-Type: application/x-www-form-urlencoded" \
#	https://agave.iplantc.org/token

# renew token
#curl -sk -X POST \
#	-d "grant_type=refresh_token&scope=PRODUCTION&refresh_token=b546d976911cd4a0a958e6f762ebcadf" \
#	-u "$CLIENT_KEY:$CLIENT_SECRET" \
#	-H "Content-Type: application/x-www-form-urlencoded" \
#	https://$API_BASE_URL/token

sub _auth_post_token {
	
	# Retrieve a token in user mode
	my ($self, $refresh_token) = @_;

	my $ua = $self->_setup_user_agent;
	$ua->default_header( Authorization => 'Basic ' . _encode_credentials($self->{apikey}, $self->{apisecret}) );
	
	my $auth_ep = $self->_get_end_point;
	my $url = "https://" . $self->hostname . "/$auth_ep";

	my $uri = URI::Encode->new;
	my $content = {
            scope => 'PRODUCTION',
            grant_type => 'client_credentials',
            username => $uri->encode( $self->user ),
            password => $uri->encode( $self->password ),
        };

    if ($refresh_token) {
		$content = {
            scope => 'PRODUCTION',
            grant_type => 'refresh_token',
            refresh_token => $refresh_token,
        };
    }

	print STDERR  '..::Auth::_auth_post_token: ', $url, $/ if $self->debug;

	my $res = $ua->post( $url, $content);
	
	my $mref;
	my $message = $res->content;
	my $json = JSON->new->allow_nonref;

    if ($res->is_success) {
        $mref = try {
                $json->decode( $message );
            }
            catch {
	    		print STDERR  $message, $/;
                Agave::Exceptions::AuthFailed->throw("Auth failed:\n" . $message);
            };

		if ($mref) {
			if (defined($mref->{access_token}) && defined $mref->{expires_in} ) {
				$self->{access_token} = $mref->{access_token};
				$self->{refresh_token} = $mref->{refresh_token};
				$self->{token_expires_in} = $mref->{expires_in};
				$self->{token_expires_at} = time() + $mref->{expires_in};
				$self->{token_type} = $mref->{token_type};
				return $mref->{'access_token'};
			}
			else {
				print STDERR  $mref->{'status'} || $mref->{error}, ": ", $mref->{'message'} || $mref->{error_description}, $/;
                Agave::Exceptions::AuthFailed->throw($mref->{message} || $mref->{error_description});
			}
		} else {}
	} else {
		print STDERR (caller(0))[3], " ", $res->status_line, "\n";
        Agave::Exceptions::HTTPError->throw(
            code => $res->code,
            message => $res->message,
            content => $res->content,
        );
	}

}

sub refresh {
	my ($self, $refresh_token) = @_;

	#return unless $self->{refresh_token} && $refresh_token;
	$self->_auth_post_token($self->{refresh_token} || $refresh_token);
}

=head2 is_token_valid - not working in v2

  Checks if the token has expired or not.
  It returns the # of seconds till the expiration of the token.
  This info can be used to reissue a token or to revalidate the token that
  will soon expire.

=cut

sub is_token_valid {
	my ($self) = shift;

    return 0;
	
	unless ($self->token_expiration) {
		my $ua = $self->_setup_user_agent;
		$ua->default_header( Authorization => 'Basic ' . _encode_credentials($self->user, $self->token) );
	
		my $auth_ep = $self->_get_end_point;
		my $url = "https://" . $self->hostname . "/$auth_ep";

		print STDERR  '..::Auth::is_token_valid: ', $url, $/ if $self->debug;

		my $req = HTTP::Request->new(GET => $url);
		my $res = $ua->request($req);
	
		my $message;
		my $mref;
		my $json = JSON->new->allow_nonref;

		if ($res->is_success) {
			$message = $res->content;
			$mref = eval {$json->decode( $message );};
			if ($mref) {
				if ($mref->{status} eq 'success') {
					return 1;
				}
				else {
					return;
				}
			}
			else {
				print STDERR  $message, $/;
				return;
			}
		} else {
			print STDERR (caller(0))[3], " ", $res->status_line, "\n"
                if $self->debug;
			return;
		}
	}

	my $delta = $self->token_expiration - time();
	print STDERR "DELTA is_token_valid: ", $delta, $/;

	return $delta > 0 ? $delta : 0;
}

=head2 token_expiration

  Returns the timestamp of when the token will expire, if available.

=cut

sub token_expiration_in {
	my ($self) = shift;
	return $self->{token_expires_in};
}

sub token_expiration_at {
	my ($self) = shift;
	return $self->{token_expires_at};
}

sub _encode_credentials {
	
	# u is always an iPlant username
	# p can be either a password or RSA encrypted token
	
	my ($u, $p) = @_;
	#encode_base64("$u:$p");
	my $uri = URI::Encode->new;
	encode_base64(join(':', $uri->encode($u), $uri->encode($p)));
}

=head1 AUTHOR

Cornel Ghiban, C<< <cghiban at gmail.com> >>

=head1 BUGS

Please report any bugs or feature requests to the above email address.

=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Agave::Client::Auth


You can also look for information at:

=over 4

http://agaveapi.co/

=back


=head1 ACKNOWLEDGEMENTS

iPlant, DNALC, TACC, CSHL


=head1 COPYRIGHT & LICENSE

Copyright 2013 Cornel Ghiban.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut

1; # End of Agave::Client::Auth
