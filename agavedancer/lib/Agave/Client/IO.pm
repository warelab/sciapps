package Agave::Client::IO;

use warnings;
use strict;
use Carp;
use HTTP::Request::Common qw(POST);
use URI::Escape;
use Try::Tiny;
use Data::Dumper;

use Agave::Client::Object::File;
use base qw/Agave::Client::Base/;
use JSON ();

=head1 NAME

Agave::Client::IO - The great new Agave::Client::IO!

=head1 VERSION

Version 0.02

=cut

our $VERSION = '0.02';

{
my @permissions = qw/READ WRITE EXECUTE READ_WRITE READ_EXECUTE WRITE_EXECUTE ALL NONE/;

=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client::IO;
    my $foo = Agave::Client::IO->new();
    my $io = $foo->io;
    ...

=head1 EXPORT

A list of functions that can be exported.  You can delete this section
if you don't export anything, such as for a purely object-oriented module.

=head1 FUNCTIONS

=head2 readdir

=cut

# List iRODS directory/retrieves directory contents
sub readdir {
	my ($self, $path) = @_;

	# Check for a request path
	unless (defined($path)) {
		print STDERR "Please specify a path for which you want contents retrieved\n";
		return;
	}

	$path = "/$path" unless $path =~ m/^\//;

	my $list = $self->do_get('/listings' . $path);
	return @$list ? [map {Agave::Client::Object::File->new($_)} @$list] : [];
}

=head2 ls

	Alias for <readdir>.

=cut

# alias for readdir
sub ls {
	my ($self, $path) = @_;
	$self->readdir($path);
}

=head2 mkdir

=cut

# creates a new directory in the specified path
sub mkdir {
	my ($self, $path, $new_dir) = @_;

    my $ep_path = '/media';

	# Check for a request path
	unless (defined($path)) {
		print STDERR "Please specify a path for which you want contents retrieved\n";
		return;
	}

	return $self->do_put($ep_path . $path, action => 'mkdir', path => uri_escape($new_dir));
}

=head2 remove

=cut

# remove the specified directory/file
sub remove {
	my ($self, $path) = @_;

    my $ep_path = '/media';
	# Check for a request path
	unless (defined($path)) {
		print STDERR "::IO::remove - Please specify the path you want removed\n";
		return;
	}

	$path = "/$path" unless $path =~ m/^\//;

	return $self->do_delete($ep_path . $path);
}

=head2 rename

=cut

# rename the specified directory/file
sub rename {
	my ($self, $path, $new_name) = @_;

    my $ep_path = '/media';
	# Check for the requested path to be renamed
	unless (defined($path)) {
		print STDERR "::IO::rename Please specify a path which you want renamed\n";
		return;
	}

	# Check for a request path
	unless ($new_name) {
		print STDERR "::IO::rename Please specify a new name\n";
		return;
	}

	my $st = $self->do_put($ep_path . $path, action => 'rename', path => uri_escape($new_name));
	print STDERR 'rename status: ', Dumper( $st), $/ if $self->debug;
	$st;
}

=head2 move

=cut


sub move {
	my ($self, $path, $dest) = @_;

	# note: $dest must reprezent full path, not a directory

    my $ep_path = '/media';
	# Check for a request path
	unless (defined($path)) {
		print STDERR "::IO::remove - Please specify the path you want removed\n";
		return;
	}

	$path = "/$path" unless $path =~ m/^\//;

 	my $st = $self->do_put($ep_path . $path, action => 'move', path => $dest);
 	print STDERR 'move status: ', Dumper( $st), $/ if $self->debug;
	return $st;
}

=head2 stream_file

	TODO - can it handle large files?
		- should it store data in tmp files and when done, assemble the final product?
		- should we pass it a file/filehadle to write data into?
        - should we do parallel download if server responds w/ "Accept-Ranges: bytes" header?!
            my $ua = LWP::UserAgent->new;
            $ua->default_headers->push_header(Range => "bytes=1000-2000");
            my $response = $ua->get($url);
=cut


sub stream_file {
    my ($self, $path, %params) = @_;

    # Check for the requested path to be renamed
    unless (defined($path)) {
        print STDERR "::IO::stream_file Please specify a path which you want streamed\n";
        return;
    }

    # Check for the required params (save_to, limit_size, stream_to_stdout)
    # do_get, used here, expects a JSON as result
    unless (%params) {
        $params{limit_size} = 1024;
        print STDERR '::IO::stream_file set a default limit_size to 1024', $/;
    }

    my $ep_path = '/media';
    $path = "/$path" unless $path =~ m/^\//;

    my $buffer = try {
            $self->do_get($ep_path . $path, %params);
        } catch {
            return $self->_error("IO::stream_file. Error streaming file.", $_)
                unless ref($_);
            # catch/handle the error upstream
            $_->rethrow;
        };

    return $buffer;
}

=head2 upload

=cut


# performs a file upload to the specified directory
# on success, it returns the ::IO::File representing the uploaded file
# 
sub upload {
	my ($self, $path, %params) = @_;

	my $END_POINT = $self->_get_end_point;
	unless ($END_POINT) {
        Agave::Exceptions::InvalidEndPoint->throw("do_get: invalid endpoint.");
	}

    $END_POINT .= '/media';
	
	# Check for a request path
	unless (defined($path)) {
        Agave::Exceptions::InvalidArguments->throw(
                "Please specify a RESTful path for $END_POINT"
            );
	}

	print STDERR '::do_post: ', Dumper( \%params), $/ if $self->debug;
	my $content = {};
	while (my ($k, $v) = each %params) {
		next if $k eq 'fileToUpload';
		$content->{$k} = $v;
	}
	$content->{fileToUpload} = [ $params{'fileToUpload'} ];
	
	$HTTP::Request::Common::DYNAMIC_FILE_UPLOAD = 1;

	my $ua = $self->_setup_user_agent;
	print STDERR "\nhttps://" . $self->hostname . "/" . $END_POINT . $path, "\n" if $self->debug;

	my $req = POST "https://" . $self->hostname . "/" . $END_POINT . $path,
			    Content_Type => 'form-data',
			    Content	=> $content;

	#---
	my $callback = $req->content;
	#my $total;
	#my $size = $req->header('content-length');
	$req->content(sub {
		my $chunk = $callback->();

		#if ($chunk) {
		#    my $length = length $chunk;
		#    $total += $length;
		#    printf "%+5d = %5.1f%%\n", $length, $total / $size * 100;
		#}
		#else {
		#    print "Completed\n";
		#}
		$chunk;
	});

	my $res = $ua->request($req);

	$HTTP::Request::Common::DYNAMIC_FILE_UPLOAD = 0;
	# some code taken from here: 
	# http://stackoverflow.com/questions/24631258/progress-indicator-for-perl-lwp-post-upload
	#---

	# Parse response
	my $message;
	my $mref;
	
	#print STDERR Dumper( $res ), $/;
	if ($res->is_success) {
		$message = $res->content;
		if ($self->debug) {
			print STDERR $message, "\n";
		}
		my $json = JSON->new->allow_nonref;
		$mref = eval {$json->decode( $message );};
		if ($mref) {
			if ($mref->{status} eq 'success') {
				return Agave::Client::Object::File->new($mref->{result});
			}
			else {
				print STDERR "::upload error: ", $mref->{message}, $/;
			}
		}
	}
	else {
		print STDERR $res->status_line, "\n";
	}
	return;
}

=head2 share

=cut

sub share {
	my ($self, $path, $ipc_user, $perm, $recursive) = @_;

	$perm ||= '';
	my %p = ();
	for my $okp (@permissions) {
		if ($okp eq $perm) {
			$p{permission} = $okp;
			last;
		}
	}

	print STDERR  'permissions to set: ', join (', ', keys %p), $/ if $self->debug;

	return $self->_error("IO::share: nothing to share. ") unless ($path && $ipc_user && %p);

	$path = "/$path" unless $path =~ m/^\//;
	$path = '/pems' . $path;
	$p{username} = $ipc_user;

	unless ($recursive) {
		$p{recursive} = 'false';
	}
	else {
		$p{recursive} = 'true';
	}
	
	my $resp = try {
            $self->do_post($path, %p);
        }
        catch {
	        return $self->_error( ref $_ ? $_->message : "IO::share: Unable to share file.", $_);
        };
	# due to how do_post works:
	return ref($resp) ? $resp : {'status' => 'success'};
}

=head2 get_perms

    Gets permisions for a specified path

    $perms = $io->get_perms($path);
    say 'owner: ', $perms->{owner}; # 'you'
    for my $p (@{$perms->{permissions}}) {
        say $p->{username}, "\t", 
            join(",", map {"$_"} 
                grep {$p->{permission}->{$_}} 
                keys %{$p->{permission}}
            );
    }

=cut

sub get_perms {
    my ($self, $path) = @_;

    $path = "/$path" unless $path =~ m/^\//;
    $path = '/pems' . $path;

    my $resp = try {
            $self->do_get($path);
        }
        catch {
	        return $self->_error("IO::get_perms: Unable read file permissions.", $_)
                unless ref($_);
            if ($_->isa('Agave::Exceptions::HTTPError')) {
                return {status => 'error', message => $_->code . ' ' . $_->message}
            }
            else {
                $_->rethrow;
            }
        };
    if (ref $resp && ref $resp eq 'ARRAY' && @$resp) {
        return $resp;
    }
}


=head2 import_file

=cut

sub import_file {
	my ($self, $path, $params) = @_;

	# curl -sk -H "Authorization: Bearer 123abc" \
	# -X POST \
	# --data-urlencode "urlToIngest=agave://dnasubway-cfncluster.us-west-1.compute.amazonaws.com/scratch/ghiban/job-1202088293959003675-ee4acae9fffff7a7-0001-007-fx2291/fastx_out/WT_rep2-fx2291_fastqc.html" \
	# --data-urlencode "notifications=ghiban@cshl.edu" \
	# --data-urlencode "fileType=" \
	# --data-urlencode "fileName=" \
	# https://agave.iplantc.org/files/v2/media/ghiban/tmp/?pretty=true
$DB::single = 2;

	# Check for a request path
	unless (defined($path)) {
		Agave::Exceptions::InvalidArguments->throw(
			"Please specify a RESTful path for A::C::IO::import()"
		);
	}

	$path = "/$path" unless $path =~ m/^\//;

	my $json = JSON->new->utf8;
	# to specify the systemid set the _sub_end_point to 'media/system/${systemid}'
	# eg: media/system/data.iplantcollaborative.org
	my %p = (
			_sub_end_point => 'media',	# files/v2/media
			_content_type => 'application/json; charset=utf-8',
			_body => $json->encode({
				urlToIngest => $$params{urlToIngest},
				fileType => $$params{fileType} || '',
				fileName => $$params{fileName} || '',
				notifications => $$params{notifications} || [],
			}),
		);
	
	my $resp = try {
			$self->do_post($path, %p);
		}
		catch {
			return $self->_error("IO::import: Unable to import file.", $_);
		};
	# due to how do_post works:
	return ref($resp) ? $resp : {'status' => 'success'};
}

=head2 file_history

returns a list of hashes
    [{
      "status": "STAGING_QUEUED",
      "created": "2017-07-13T10:10:31.000-05:00",
      "createdBy": "ghiban",
      "description": "File/folder queued for staging"
    },
    {
      "status": "STAGING_COMPLETED",
      "created": "2017-07-13T10:10:38.000-05:00",
      "createdBy": "ghiban",
      "description": "Staging completed successfully"
    }]

=cut

sub file_history {
	my ($self, $path) = @_;

	# Check for a request path
	unless (defined($path)) {
		print STDERR "Please specify a path\n";
		return;
	}
	$path = "/$path" unless $path =~ m/^\//;

	my $data = $self->do_get('/history' . $path);
	wantarray ? @$data : $data;
}

=head1 AUTHOR

Cornel Ghiban, C<< <cghiban at gmail.com> >>

=head1 BUGS

Please report any bugs or feature requests to C<bug-iplant-foundationalapi at rt.cpan.org>, or through
the web interface at L<http://rt.cpan.org/NoAuth/ReportBug.html?Queue=iPlant-FoundationalAPI>.  I will be notified, and then you'll
automatically be notified of progress on your bug as I make changes.




=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc Agave::Client::IO


=over 4

=back


=head1 ACKNOWLEDGEMENTS


=head1 COPYRIGHT & LICENSE

Copyright 2016 Cornel Ghiban.

This program is free software; you can redistribute it and/or modify it
under the terms of either: the GNU General Public License as published
by the Free Software Foundation; or the Artistic License.

See http://dev.perl.org/licenses/ for more information.


=cut

}

1; # End of Agave::Client::IO
