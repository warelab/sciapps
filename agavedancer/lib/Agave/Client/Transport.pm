package Agave::Client::Transport;

use strict;
use warnings;

use File::HomeDir ();
use Try::Tiny;

use Agave::Client::Exceptions ();

use LWP;
# Emit verbose HTTP traffic logs to STDERR. Uncomment
# to see detailed (and I mean detailed) HTTP traffic
#use LWP::Debug qw/+/;
use HTTP::Request::Common qw(POST);
# Needed to emit the curl-compatible form when DEBUG is enabled
#use URI::Escape;
use JSON ();
use Data::Dumper;

our $VERSION = '0.3.1';
our $AGENT = "AgavePerlClient/$VERSION";
use vars qw($VERSION $AGENT);

{
    # these should be moved to a config file (or not?)

    my $TIMEOUT = 30;

    my $TRANSPORT = 'https';

    # Define API endpoints
    my %end_point = (
            auth => 'token',
            io => 'files/v2',
            apps => 'apps/v2',
            job  => 'jobs/v2',
            client => "clients/v2",
            metadata => 'meta/v2',
            metadataschema => 'meta/v2',
            postit => 'postits/v2',
        );

    sub _get_end_point {
        my $self = shift;

        my $ref_name = ref $self;
        return unless $ref_name;
        $ref_name =~ s/^.*:://;

        return $end_point{lc $ref_name};
    }

    sub do_get {

        my ($self, $path, %params) = @_;

        my $END_POINT = $self->_get_end_point;
        unless ($END_POINT) {
            Agave::Exceptions::InvalidEndPoint->throw("do_get: invalid endpoint.");
        }
        print STDERR  $END_POINT, $/ if $self->debug;

        # Check for a request path
        unless (defined($path)) {
            Agave::Exceptions::InvalidArguments->throw(
                    "Please specify a RESTful path for $END_POINT"
                );
        }
        print STDERR  "::do_get: path: ", $path, $/ if $self->debug;
		$self->log( type => 'request', method => 'GET', path => $path);

        my $ua = $self->_setup_user_agent;
        my ($req, $res);

        if (defined $params{limit_size} || defined $params{save_to} || defined $params{stream_to_stdout}) {

            my $data;

            if ($params{save_to}) {
                my $filepath = $params{save_to};
                # should we at least check if parent directory exists?

                $res = $ua->get("$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path,
                            ':content_file' => $filepath,
                        );
                $data = 1;
            }
            elsif ($params{stream_to_stdout}) {
                $res = $ua->get("$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path,
                            #':read_size_hint' => $params{limit_size} > 0 ? $params{limit_size} : undef,
                            ':content_cb' => sub {my ($d)= @_; print STDOUT $d;},
                        );
                $data = 1;
            }
            else {
                $res = $ua->get("$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path,
                            ':read_size_hint' => $params{limit_size} > 0 ? $params{limit_size} : undef,
                            ':content_cb' => sub {my ($d)= @_; $data = $d; die();},
                        );
            }

			$self->log( type => 'response', method => 'GET',
				path => $path, code => $res->code,);

            if ($res->is_success) {
                return $data;
            }
            else {
                print STDERR $res->status_line, "\n" if $self->debug;
                Agave::Exceptions::HTTPError->throw(
                        code => $res->code,
                        message => $res->message,
                        content => $res->content,
                    );
            }
        }
        else {
            $req = HTTP::Request->new(GET => "$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path);
            $res = $ua->request($req);

			$self->log( type => 'response', method => 'GET', path => $path,
				code => $res->code, content => $res->content);
        }
        
        print STDERR "\n$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path, "\n" if $self->debug;
        
        # Parse response
        my $message = $res->content;
        # success or we have a json resp
        my $headers = $res->headers;
        my $is_json = $headers->{'content-type'} =~ m'^application/json';
        if ($res->is_success || $is_json) {
            my $mref;
            print STDERR $message, "\n" if $self->debug;

            my $json = JSON->new->allow_nonref;
            try {
                 $mref = $json->decode( $message );
            }
            catch {
				my $err_msg = 'Invalid response. Expecting JSON.';
				if ($message =~ /<ams:message>(.+)<\/ams:message>/) {
					$err_msg = $1;
				}
                Agave::Exceptions::HTTPError->throw(
                    code => $res->code,
                    message => $err_msg,
                    content => $message,
                );
            };

            # check for API errors
            my $fault = $mref->{fault};
            if ($mref && $fault) {
                Agave::Exceptions::HTTPError->throw(
                    code => $fault->{code},
                    message => ($fault->{type} || '') . ' ' . ($fault->{message} || '' ) || 'do_get: error',
                    content => $message,
                );              
            }

            if ($mref && $mref->{status} eq 'success') {
                return $mref->{result};
            }
            else {
                Agave::Exceptions::HTTPError->throw(
                    code => $res->code,
                    message => $mref->{message} || 'do_get: error',
                    content => $res->content,
                );
            }
        }
        else {
            print STDERR $res->status_line, "\n" if $self->debug;
            print STDERR $req->content, "\n" if $self->debug;

			my $err_msg = 'Invalid response. Expecting JSON.';
			if ($message =~ /<ams:message>(.+)<\/ams:message>/) {
				$err_msg = $1;
			}
            Agave::Exceptions::HTTPError->throw(
                code => $res->code,
                message => $err_msg,
                content => $res->content,
            );
        }
    }

    sub do_put {

        my ($self, $path, %params) = @_;

        my $END_POINT = $self->_get_end_point;
        unless ($END_POINT) {
            Agave::Exceptions::InvalidEndPoint->throw("do_put: Invalid endpoint.");
        }
        
        # Check for a request path
        unless (defined($path)) {
            Agave::Exceptions::InvalidArguments->throw(
                    "Please specify a RESTful path for $END_POINT"
                );
        }

        print STDERR '::do_put: ', Dumper( \%params), $/ if $self->debug;
        my $content = '';
        while (my ($k, $v) = each %params) {
            $content .= "$k=$v&";
        }
	    my $log_path = $path . '?' . $content;
		$self->log( type => 'request', method => 'PUT', path => $log_path);

        my $ua = $self->_setup_user_agent;
        #print STDERR Dumper( $ua), $/;
        print STDERR "\n$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path, "\n" if $self->debug;
        my $req = HTTP::Request->new(PUT => "$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path);
        $req->content($content) if $content;
        my $res = $ua->request($req);

		$self->log( type => 'response', method => 'PUT', path => $log_path,
			code => $res->code, content => $res->content);
        
        # Parse response
        my $message;
        my $mref;
        
        if ($res->is_success) {
            $message = $res->content;
            if ($self->debug) {
                print STDERR $message, "\n";
            }
            my $json = JSON->new->allow_nonref;
            $mref = eval {$json->decode( $message );};
            return $mref;
        }
        else {
	    	print STDERR (caller(0))[3], " ", $res->status_line, "\n";
            Agave::Exceptions::HTTPError->throw(
                code => $res->code,
                message => $res->message,
                content => $res->content,
            );
        }
    }

    sub do_delete {

        my ($self, $path, %params) = @_;

        my $END_POINT = $self->_get_end_point;
        unless ($END_POINT) {
            Agave::Exceptions::InvalidEndPoint->throw("do_delete: Invalid endpoint.");
        }
        
        # Check for a request path
        unless (defined($path)) {
            Agave::Exceptions::InvalidArguments->throw(
                    "Please specify a RESTful path for $END_POINT"
                );
        }
        print STDERR  "DELETE Path: ", $path, $/ if $self->debug;

		$self->log( type => 'request', method => 'DELETE', path => $path);

        my $ua = $self->_setup_user_agent;
        my $req = HTTP::Request->new(DELETE => "$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path);
        my $res = scalar(%params) 
				? $ua->request($req, %params) 
				: $ua->request($req);

		$self->log( type => 'response', method => 'DELETE', path => $path,
			code => $res->code, content => $res->content);

        print STDERR "\nDELETE => $TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path, "\n" if $self->debug;
        
        # Parse response
        my $message;
        my $mref;
        
        if ($res->is_success) {
            $message = $res->content;
            print STDERR $message, "\n" if $self->debug;

            my $json = JSON->new->allow_nonref;
            $mref = eval { $json->decode( $message ); };
            if ($mref && $mref->{status} eq 'success') {
                return $mref;
            }
            return $mref;
        }
        else {
            print STDERR 'do_delete: ', (caller(0))[3], " ", $res->status_line, "\n";
            Agave::Exceptions::HTTPError->throw(
                code => $res->code,
                message => $res->message,
                content => $res->content,
            );
        }
    }

    sub do_post {

        my ($self, $path, %params) = @_;

        my $END_POINT = $self->_get_end_point;

        unless ($END_POINT) {
            Agave::Exceptions::InvalidRequest->throw("Invalid endpoint $END_POINT.");
        }

		if (%params && $params{_sub_end_point}) {
			$END_POINT .= $params{_sub_end_point} =~ m|^/| 
				? $params{_sub_end_point}
				: '/' . $params{_sub_end_point};
		}
        
        # Check for a request path
        unless (defined($path)) {
            Agave::Exceptions::InvalidRequest->throw(
                    "Please specify a RESTful path for $END_POINT"
                );
        }

        $path =~ s'/$'';

		$self->log( type => 'request', method => 'POST', path => $path, params => \%params);
        print STDERR '::do_post: ', Dumper( \%params), $/ if $self->debug;
        print STDERR "\n$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path, "\n" 
            if $self->debug;

        my $ua = $self->_setup_user_agent;
        my $res;
        if (exists $params{_content_type} && exists $params{_body} ) {
            my $req = POST "$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path,
                    'Content-type' => $params{_content_type},
                    'Content' => $params{_body};
            #print STDERR Dumper( $req ), $/;
            $res = $ua->request($req);
        }
        else {
            $res = $ua->post(
                    "$TRANSPORT://" . $self->hostname . "/" . $END_POINT . $path,
                    \%params
                );
        }
		$self->log( type => 'response', method => 'POST', path => $path,
			code => $res->code, content => $res->content);

        
        # Parse response
        my $message;
        my $mref;
        
        my $json = JSON->new->allow_nonref;
        if ($res->is_success) {
            $message = $res->content;
            if ($self->debug) {
                print STDERR '::do_post content: ', $message, "\n";
            }
            $mref = eval {$json->decode( $message );};
            if ($mref && $mref->{status} eq 'success') {
                return $mref->{result};
            }
            return $mref;
        }
        else {
            #print STDERR Dumper( $res ), $/;
            print STDERR "Status line: ", (caller(0))[3], " ", $res->status_line, "\n";
            my $content = $res->content;
            print STDERR "Content: ", $content, $/;
            if ($content =~ /"status":/) {
                $mref = eval {$json->decode( $content );};
                if ($mref && $mref->{status}) {
                    #return {status => "error", message => $mref->{message} || $res->status_line};
                    Agave::Exceptions::HTTPError->throw(
                            code => $res->code,
                            message => $mref->{message} || $res->status_line,
                            content => $content,
                        );
                }
            }
            return {status => "error", message => $res->status_line};
        }
    }

    # Transport-level Methods
    # !! may be overridden in child classes
    sub _setup_user_agent {

        my $self = shift;
        my $ua = LWP::UserAgent->new;

        $ua->agent($AGENT);
        $ua->timeout( $self->{http_timeout} || $TIMEOUT);
        if (($self->user ne '') && $self->token) {
            if ($self->debug) {
                print STDERR (caller(0))[3], ": Username/token authentication selected\n";
            }
            $ua->default_header( Authorization => 'Bearer ' . $self->token );
        } else {
            if ($self->debug) {
                print STDERR (caller(0))[3], ": Sending no authentication information\n";
            }
        }

        return $ua;

    }

    sub debug {
        my $self = shift;
        if (@_) { $self->{debug} = shift }
        return $self->{debug};
    }

sub logger {
	my $self = shift;
	if (@_) { $self->{logger} = shift }
	return $self->{logger};
}

sub log {
	my $self = shift;
	my %args = @_;

	return unless $self->{logger};
	return unless keys %args;

	my %params = (
		user => $self->{user} || 'no_user',
		end_point => $self->_get_end_point || 'no_ep',
	);
	$params{$_} = $args{$_} for (keys %args);
	if (exists $params{content} && defined $params{content}) {
		$params{content} = substr($params{content}, 0, 8192);
	}

	#print STDERR Dumper( \%params ), $/;

	# we don't care about if this suceeds, for now..
	eval {
		$self->{logger}->can('log') 
			? $self->{logger}->log(\%params)
			: $self->{logger}->send(\%params);
	};
}

}

1;
