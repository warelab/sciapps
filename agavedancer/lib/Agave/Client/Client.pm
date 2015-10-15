package Agave::Client::Client;

use warnings;
use strict;

use base 'Agave::Client::Base';
use MIME::Base64 qw(encode_base64);
use Try::Tiny;
use Data::Dumper;

{ 
    sub new {
        my ($proto, $args) = @_;
        my $class = ref($proto) || $proto;
        
        if (defined $$args{username}) {
           $$args{user} = delete $$args{username};
        }
        $$args{hostname} ||= 'agave.iplantc.org';

        my $self  = { map {$_ => $args->{$_}} grep {/^(?:user|password|hostname|http_timeout|client|debug)$/} keys %$args};
        
        bless($self, $class);

    }

    # retrieves specified auth client
    sub client {
        my ($self, $client_name) = @_;
        return unless $client_name;

        eval {$self->do_get('/' . $client_name)};
    }

    # retrieves all auth clients
    sub clients {
        my ($self) = @_;
        my $list = $self->do_get('/');
        #return @$list ? [map {Agave::Client::Object::Client->new($_)} @$list] : [];
        return $list || [];
    }

    # creates a new client
    sub create {
        my ($self, $args) = @_;

        my $client_name = undef;
        if (exists $args->{name} && defined $args->{name}) {
            $client_name = $args->{name};
            $client_name =~ s/^\s+//;
            $client_name =~ s/^\s+//;
        }

        unless (defined $client_name && $client_name ne "") {
            Agave::Exceptions::InvalidArguments->throw(
                    "Please specify a name when creating a new client!"
                );
        }

        my %params = ( name => $client_name, clientName => $client_name );
        for (qw/tier description callbackUrl/) {
            $params{$_} = $$args{$_} if defined $$args{$_};
        }

        print STDERR Dumper( \%params ), $/ if $self->debug;
	    my $resp = try {
            $self->do_post('/', %params);
        }
        catch {
	        return $self->_error("Client::create: Unable to create client.", $_)
                unless ref($_);
            #if ($_->isa('Agave::Exceptions::HTTPError')) {
            #    return {status => 'error', message => $_->code . ' ' . $_->message}
            #}
            $_->rethrow;
        };

        return $resp;
    }

    # deletes specified client
    sub delete {
       my ($self, $client) = @_;

        my $client_name = ref $client ? $client->{name} : $client;

        unless (defined $client_name && $client_name ne "") {
            Agave::Exceptions::InvalidArguments->throw(
                    "Please specify a name when deleting an authentication client!"
                );
        }

	    my $resp = try {
            $DB::single = 1;
            $self->do_delete('/' . $client_name);
        }
        catch {
	        return $self->_error("Client::create: Unable to remove client.", $_)
                unless ref($_);
            #if ($_->isa('Agave::Exceptions::HTTPError')) {
            #    return {status => 'error', 
            #            message => $_->code . ' ' . $_->message,
            #            code => $_->code
            #        }
            #}
            $_->rethrow;
        };
        # no returns from the API for this request.. returning 1
        1;
    }

    # Transport-level Methods
    sub _setup_user_agent {

        my $self = shift;
        my $ua = LWP::UserAgent->new;

        $ua->agent($Agave::Client::Transport::AGENT);
        $ua->timeout( $self->{http_timeout} || 30);

        $ua->default_header( Authorization => 'Basic ' . _encode_credentials($self->user, $self->password) );

        return $ua;
    }

    # utils
    #
    sub _encode_credentials {
        
        # u is always an iPlant username
        # p can be either a password or RSA encrypted token
        
        my ($u, $p) = @_;
        encode_base64("$u:$p");
    }

}

1;
