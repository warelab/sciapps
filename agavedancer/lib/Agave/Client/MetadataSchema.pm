package Agave::Client::MetadataSchema;

use warnings;
use strict;
use base qw/Agave::Client::MetadataBase/;

=head1 NAME

Agave::Client::MetadataSchema

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

{

    sub _path {
        my $class = shift;
        return '/schemas'
    }

=head1 SYNOPSIS


    See an SYNOPSIS in Agave::Client::Metadata


=head1 FUNCTIONS

=head2 list

=head2 update

=head2 create

=head2 delete

=head2 permissions

=head2 delete_permissions

=cut

}

1;
