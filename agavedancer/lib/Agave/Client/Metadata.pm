package Agave::Client::Metadata;

use strict;
use base qw/Agave::Client::MetadataBase/;

use URI::Encode qw/uri_encode/;
use JSON ();

=head1 NAME

Agave::Client::MetadataBase

=head1 VERSION

Version 0.10

=cut

our $VERSION = '0.10';

{

    sub _path {
        my $class = shift;
        return '/data'
    }


=head1 SYNOPSIS

    use Agave::Client;
    my $api = Agave::Client->new( config_file => $conf_file );
    my $meta = $api->meta;

    # list
    $meta->list;
    $meta->list($uuid);

    # todo
    # $meta->search();

    # create a metadata object
    my $mt_desc = {
        name => 'my-own-test-' . rand(),
        title => 'this is a test',
        value => { ana => 'are mere' },
    };
    my $mobj = $meta->create($mt_desc);

    # get permissions
    my $perms = $meta->permissions($uuid);
    my $perms = $meta->permissions($mobj);

    # set permissions
    my $perms = $meta->permissions($mobj, $username, 'READ');

    # delete permissions
    my $perms = $meta->delete_permissions($mobj, $username);

    # delete metadata object
    my $perms = $meta->delete($mobj);

    ...

=head1 FUNCTIONS

=head2 list

=head2 update

=head2 create

=head2 delete

=head2 permissions

=head2 delete_permissions

=head2 query

=cut

    sub query {
	    my ($self, $filter) = @_;

        return [] unless ($filter);

        if (ref $filter) {
            $filter = JSON->new->utf8->encode($filter);
        }
        
        my $uri = URI::Encode->new({encode_reserved => 1});
        my $path = $self->_path . '?q=' . $uri->encode($filter);

	    return eval {$self->do_get($path);};
    }


}

1;
