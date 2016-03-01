package Agave::Client::Metadata;

use warnings;
use strict;
use Carp;
use HTTP::Request::Common qw(POST);
use URI::Escape;
use Try::Tiny;
use Data::Dumper;
use JSON ();

use base qw/Agave::Client::Base/;

=head1 NAME

Agave::Client::Metadata

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

{

    my @permissions = qw/READ WRITE READ_WRITE ALL NONE/;


=head1 SYNOPSIS

Quick summary of what the module does.

Perhaps a little code snippet.

    use Agave::Client::IO;
    my $foo = Agave::Client::IO->new();
    my $io = $foo->io;
    ...

=head1 FUNCTIONS

=head2 list

=cut


    sub list {
	    my ($self, $id) = @_;
        
        my $path = '/data';
        if (defined $id) {
            $path .= '/' . $id
        }
	    return eval {$self->do_get($path);};
    }


=head2 update

=cut

    sub update {
        my ($self, $h, $id) = @_;

        # check for 'name' & 'value' keys  in %$h

        unless ($id) {
            $id = $$h{uuid};
        }

        return unless $id;

        my $json = JSON->new->utf8;
        my $js = $json->encode($h);

        $self->do_post("/data/$id",
                _content_type => 'application/json; charset=utf-8', 
                _body => $js
            );
    }



=head2 create

=cut

    sub create {
        my ($self, $h) = @_;

        # check for 'name' & 'value' keys  in %$h

        my $json = JSON->new->utf8;
        my $js = $json->encode($h);

        $self->do_post('/data', 
                _content_type => 'application/json; charset=utf-8', 
                _body => $js
            );
    }

=head2 delete

=cut

    sub delete {
        my ($self, $id) = @_;

        return unless $id;
        if ('HASH' eq ref $id && $$id{uuid}) {
            $id = $$id{uuid}
        }

        my $resp = $self->do_delete('/data/' . $id);
        return $resp && ref $resp && $resp->{status} eq 'success';
    }


=head2 permissions

=cut

    sub permissions {
        my ($self, $id, $user, $perm) = @_;

        if ('HASH' eq ref $id && $$id{uuid}) {
            $id = $$id{uuid}
        }
        return unless $id;

        my $path = '/data/' . $id . '/pems';

        if ($user && $perm) {
        	my %p = ();
            for my $okp (@permissions) {
                if ($okp eq $perm) {
                    $p{permission} = $okp;
                    last;
                }
            }
            if (keys %p) {
                return $self->do_post( "$path/$user", %p );
            }
        }

        return eval {$self->do_get($path);} || [];
    }


=head2 delete_permissions

=cut

    sub delete_permissions {
       my ($self, $id, $user) = @_;

        if ('HASH' eq ref $id && $$id{uuid}) {
            $id = $$id{uuid}
        }
        return unless ($id && $user);


        return $self->permissions($id, $user, 'NONE');
    }
}

1;
