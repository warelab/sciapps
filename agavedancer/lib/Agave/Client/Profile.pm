package Agave::Client::Profile;

use warnings;
use strict;
#use Data::Dumper;

use base qw/Agave::Client::Base/;

=head1 NAME

Agave::Client::Profile

=head1 VERSION

Version 0.02

=cut

our $VERSION = '0.02';

{
    sub list {
        my ($self, $username) = @_;

        return unless (defined $username);
        return eval {$self->do_get("/$username");};
    }

    sub search {
		my ($self, $args) = @_;

        my $uri = '';
        if (exists $$args{username} && $$args{username} ne '') {
            $uri = '/?username=' . $$args{username};
        }
        elsif (exists $$args{email} && $$args{email} ne '') {
            $uri = '/?email=' . $$args{email};
        }
        if ($uri) {
            #print STDERR  $uri, $/;
            return eval {$self->do_get($uri);} || [];
        }
        else {
            return [];
        }
    }
}

1;
