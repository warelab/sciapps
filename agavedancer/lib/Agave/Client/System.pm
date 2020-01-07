package Agave::Client::System;

use warnings;
use strict;

use base qw/Agave::Client::Base/;

=head1 NAME

Agave::Client::System

=head1 VERSION

Version 0.01

=cut

our $VERSION = '0.01';

{
    sub list {
        my ($self, $id, $filters) = @_;

        # $id here is actually $filters
        if ('HASH' eq ref $id && !$filters) {
            return $self->list(undef, $id);
        }

        if (defined $id && $id ne "") {
            return $self->do_get("/$id");
        }

        # set default filters
        if (! $filters || 'HASH' ne ref $filters) {
            $filters = {limit => 100, offset => 0};
        }
        $filters->{limit} //= 100;
        $filters->{offset} //= 0;

        my $qargs = '';
        while (my ($k, $v) = each %$filters) {
            if ($k ne '' && $v ne '') {
                $qargs .= "$k=$v&";
            }
        }
        $qargs =~ s/&$//;
        #print STDERR  'qargs: ', $qargs, $/;
        return $self->do_get("/?" . $qargs);
    }

    sub queues {
		my ($self, $id, $qname) = @_;

        $id //= '';
        return if ($id eq ''); # system id is needed

        my $uri = "/$id/queues";
        return eval {$self->do_get($uri);} || [];
    }

    sub queue {
		my ($self, $id, $qname) = @_;

        $id //= '';
        $qname //= '';

        return if ( $id eq '' || $qname eq '');
        my $uri = "/$id/queues/$qname";
        #print STDERR '$uri:', $uri, $/;
        return eval {$self->do_get($uri);};
    }

}

1;
